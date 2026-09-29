# UTG Catalog

UTG Catalog is a Next.js application with an Electron desktop wrapper. The
browser-based development and production commands remain available alongside
the desktop app. Its interface uses the bundled DTM Mono font, a black canvas,
and two layered pixel grids that drift continuously in opposite diagonal
directions without depending on scrolling. Grid animation respects reduced
motion preferences. Controls use orange `#FF7F27` with yellow `#FFFF00`
hover and keyboard-focus states. The supplied individuality icon is bundled
locally; no visual assets are fetched from third-party services.

## Browser app

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. For a production browser server, run
`npm run build` followed by `npm run start`. Set `DATABASE_URL` in `.env` to a
writable SQLite database before using the API. The dev and start scripts apply
pending Prisma migrations before launching Next.js. Custom emoji uploads in
development are stored under `.cataloger-data/custom-emojis` in the project
directory; set `CATALOGER_DATA_DIR` to use another writable location.

## Electron desktop app

Run `npm run electron:dev` to launch a private Next.js development server inside
the desktop workflow. Both desktop modes store the SQLite database and custom
emoji images in Electron's per-user `userData` directory. Create a production installer for the current platform
with `npm run electron:build`, or use `npm run electron:build:win`,
`npm run electron:build:mac`, or `npm run electron:build:linux` to target a
specific platform.

The installer is presented as UTG Catalog and includes the production Next.js server and API routes; it does
not use a static export. On first launch, Prisma applies packaged migrations
and stores the SQLite database in Electron's per-user `userData` directory.
The desktop server listens only on a dynamically assigned loopback port.
Custom tag emojis accept PNG, GIF, WebP, and JPEG images up to 1 MB and
256 × 256 pixels, with a library limit of 250 images. Give each image a unique
name (letters, numbers, underscores, or hyphens; up to 32 characters) and
assign it from the tag editor's emoji library. An image cannot be deleted while
a tag uses it; both the image and its library entry persist in local app data.
The browser commands continue to use the `DATABASE_URL` configured for that
environment.
