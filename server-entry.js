const { createServer } = require('node:http');
const next = require('next');

async function start() {
  const app = next({
    dev: false,
    dir: __dirname,
    hostname: '127.0.0.1',
  });

  await app.prepare();

  const server = createServer(app.getRequestHandler());
  server.listen(0, '127.0.0.1', () => {
    const address = server.address();
    if (!address || typeof address === 'string') {
      throw new Error('The application server did not bind to a TCP port.');
    }

    process.stdout.write(`CATALOGER_SERVER_READY:${address.port}\n`);
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      server.close(() => process.exit(0));
    });
  }
}

start().catch((error) => {
  console.error('Failed to start the Next.js server:', error);
  process.exitCode = 1;
});
