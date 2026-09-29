const { app, BrowserWindow, dialog, ipcMain, Menu, Tray } = require('electron');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');

const isDev = !app.isPackaged;
const projectPath = app.getAppPath();
const preloadPath = path.join(projectPath, 'preload.js');
const iconPaths = {
  win32: path.join(projectPath, 'assets', 'icon.ico'),
  darwin: path.join(projectPath, 'assets', 'icon.icns'),
  linux: path.join(projectPath, 'assets', 'icon.png'),
};
const iconPath = iconPaths[process.platform];
const startupTimeoutMs = 60_000;

let mainWindow = null;
let tray = null;
let serverProcess = null;
let appUrl = null;

function createDatabaseUrl(databasePath) {
  const normalizedPath = path.resolve(databasePath).replace(/\\/g, '/');
  const encodedPath = normalizedPath
    .split('/')
    .map((segment, index) =>
      index === 0 && /^[A-Za-z]:$/.test(segment)
        ? segment
        : encodeURIComponent(segment),
    )
    .join('/');

  return `file:${encodedPath}`;
}

function findPrismaEngine(directory, filenamePattern, engineName) {
  const filename = fs
    .readdirSync(directory)
    .find((entry) => filenamePattern.test(entry));

  if (!filename) {
    throw new Error(`The packaged ${engineName} was not found in ${directory}.`);
  }

  return path.join(directory, filename);
}

function copyDirectory(source, destination) {
  fs.mkdirSync(destination, { recursive: true });

  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const destinationPath = path.join(destination, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destinationPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(sourcePath, destinationPath);
    } else {
      throw new Error(`Unsupported Prisma migration asset: ${sourcePath}`);
    }
  }
}

function createServerEnvironment(nodeEnv) {
  const userDataPath = app.getPath('userData');
  fs.mkdirSync(userDataPath, { recursive: true });

  const environment = {
    ...process.env,
    NODE_ENV: nodeEnv,
    NEXT_TELEMETRY_DISABLED: '1',
    CATALOGER_DATA_DIR: userDataPath,
    DATABASE_URL: createDatabaseUrl(path.join(userDataPath, 'cataloger.db')),
  };

  if (app.isPackaged) {
    const unpackedNodeModules = path.join(
      process.resourcesPath,
      'app.asar.unpacked',
      'node_modules',
    );
    environment.PRISMA_SCHEMA_ENGINE_BINARY = findPrismaEngine(
      path.join(unpackedNodeModules, '@prisma', 'engines'),
      process.platform === 'win32'
        ? /^schema-engine-.+\.exe$/
        : /^schema-engine-.+$/,
      'schema engine',
    );
    environment.PRISMA_QUERY_ENGINE_LIBRARY = findPrismaEngine(
      path.join(
        process.resourcesPath,
        'app.asar.unpacked',
        'src',
        'generated',
        'prisma',
      ),
      /(?:query_engine|libquery_engine).+\.node$/,
      'query engine library',
    );
  }

  return environment;
}

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close((error) => {
        if (error) reject(error);
        else if (address && typeof address === 'object') resolve(address.port);
        else reject(new Error('Could not allocate a development server port.'));
      });
    });
  });
}

function runNodeScript(scriptPath, args, environment) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      cwd: app.getPath('userData'),
      env: { ...environment, ELECTRON_RUN_AS_NODE: '1' },
      stdio: 'inherit',
      windowsHide: true,
    });

    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(
            `Command failed (${signal || `exit code ${code}`}): ${scriptPath}`,
          ),
        );
      }
    });
  });
}

async function migrateDatabase(environment) {
  const prismaCli = path.join(projectPath, 'node_modules', 'prisma', 'build', 'index.js');
  let migrationDirectory = null;
  let schemaPath = path.join(projectPath, 'prisma', 'schema.prisma');

  if (app.isPackaged) {
    migrationDirectory = fs.mkdtempSync(
      path.join(app.getPath('userData'), 'cataloger-migrations-'),
    );
    const migrationSchemaDirectory = path.join(migrationDirectory, 'prisma');
    fs.mkdirSync(migrationSchemaDirectory, { recursive: true });
    fs.copyFileSync(
      path.join(projectPath, 'prisma', 'schema.prisma'),
      path.join(migrationSchemaDirectory, 'schema.prisma'),
    );
    copyDirectory(
      path.join(projectPath, 'prisma', 'migrations'),
      path.join(migrationSchemaDirectory, 'migrations'),
    );
    schemaPath = path.join(migrationSchemaDirectory, 'schema.prisma');
  }

  try {
    await runNodeScript(prismaCli, ['migrate', 'deploy', '--schema', schemaPath], environment);
  } finally {
    if (migrationDirectory) {
      fs.rmSync(migrationDirectory, { recursive: true, force: true });
    }
  }
}

function waitForServer(child) {
  return new Promise((resolve, reject) => {
    let output = '';
    let settled = false;

    const timeout = setTimeout(() => {
      finish(new Error('The application server did not start in time.'));
      child.kill();
    }, startupTimeoutMs);

    function finish(error, url) {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      child.stdout.removeListener('data', onOutput);
      child.removeListener('error', onError);
      child.removeListener('exit', onExit);
      if (error) reject(error);
      else resolve(url);
    }

    function onOutput(chunk) {
      output += chunk.toString();
      const lines = output.split(/\r?\n/);
      output = lines.pop() || '';

      for (const line of lines) {
        const match = line.match(/^CATALOGER_SERVER_READY:(\d+)$/);
        if (match) {
          finish(null, `http://127.0.0.1:${match[1]}`);
        } else if (line) {
          console.log(`[UTG Catalog server] ${line}`);
        }
      }
    }

    function onError(error) {
      finish(error);
    }

    function onExit(code, signal) {
      finish(
        new Error(
          `The application server stopped before it was ready (${signal || `exit code ${code}`}): ${output}`,
        ),
      );
    }

    child.stdout.on('data', onOutput);
    child.once('error', onError);
    child.once('exit', onExit);
    child.stderr.on('data', (chunk) => {
      console.error(`[UTG Catalog server] ${chunk.toString().trimEnd()}`);
    });
  });
}

async function waitForDevelopmentServer(child, port) {
  const url = `http://127.0.0.1:${port}`;
  const timeoutAt = Date.now() + startupTimeoutMs;
  child.stdout.on('data', (chunk) => {
    console.log(`[UTG Catalog dev server] ${chunk.toString().trimEnd()}`);
  });
  child.stderr.on('data', (chunk) => {
    console.error(`[UTG Catalog dev server] ${chunk.toString().trimEnd()}`);
  });

  while (Date.now() < timeoutAt) {
    if (child.exitCode !== null || child.signalCode !== null) {
      throw new Error(
        `The development server stopped before it was ready (${child.signalCode || `exit code ${child.exitCode}`}).`,
      );
    }
    try {
      await fetch(url, { signal: AbortSignal.timeout(1500) });
      return url;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  child.kill();
  throw new Error('The development server did not start in time.');
}

async function startPackagedServer() {
  const environment = createServerEnvironment('production');
  await migrateDatabase(environment);

  serverProcess = spawn(
    process.execPath,
    [path.join(projectPath, 'server-entry.js')],
    {
      cwd: app.getPath('userData'),
      env: { ...environment, ELECTRON_RUN_AS_NODE: '1', HOSTNAME: '127.0.0.1' },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    },
  );

  return waitForServer(serverProcess);
}

async function startDevelopmentServer() {
  const environment = createServerEnvironment('development');
  await migrateDatabase(environment);
  const port = await getAvailablePort();
  const nextCli = path.join(projectPath, 'node_modules', 'next', 'dist', 'bin', 'next');

  serverProcess = spawn(
    process.execPath,
    [nextCli, 'dev', '--hostname', '127.0.0.1', '--port', String(port)],
    {
      cwd: projectPath,
      env: { ...environment, ELECTRON_RUN_AS_NODE: '1' },
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    },
  );
  return waitForDevelopmentServer(serverProcess, port);
}

function createWindow() {
  const options = {
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    center: true,
    backgroundColor: '#000000',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      sandbox: true,
    },
  };

  if (iconPath && fs.existsSync(iconPath)) options.icon = iconPath;

  mainWindow = new BrowserWindow(options);
  const allowedOrigin = new URL(appUrl).origin;

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (new URL(url).origin !== allowedOrigin) event.preventDefault();
  });
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.loadURL(appUrl).catch((error) => {
    console.error('Failed to load UTG Catalog:', error);
  });

  if (isDev) mainWindow.webContents.openDevTools();
}

function createTray() {
  if (process.platform !== 'win32' || !fs.existsSync(iconPath)) return;

  tray = new Tray(iconPath);
  tray.setToolTip('UTG Catalog');
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Open App', click: () => mainWindow?.show() },
      { label: 'Quit', click: () => app.quit() },
    ]),
  );
  tray.on('click', () => mainWindow?.show());
}

ipcMain.handle('get-app-data-path', () => app.getPath('userData'));

app.whenReady()
  .then(async () => {
    appUrl = app.isPackaged
      ? await startPackagedServer()
      : await startDevelopmentServer();
    createWindow();
    createTray();
  })
  .catch((error) => {
    console.error('Failed to start UTG Catalog:', error);
    dialog.showErrorBox(
      'UTG Catalog could not start',
      `The application failed to initialize.\n\n${error.message}`,
    );
    app.quit();
  });

app.on('activate', () => {
  if (mainWindow === null && appUrl) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (serverProcess && !serverProcess.killed) serverProcess.kill();
});
