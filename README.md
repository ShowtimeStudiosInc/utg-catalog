# RP Cataloger

RP Cataloger is a Next.js application with an Electron desktop wrapper. The
browser-based development and production commands remain available alongside
the desktop app. Its original, high-contrast night-sky interface uses local
system fonts and does not fetch visual assets from third-party services.

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

The installer includes the production Next.js server and API routes; it does
not use a static export. On first launch, Prisma applies packaged migrations
and stores the SQLite database in Electron's per-user `userData` directory.
The desktop server listens only on a dynamically assigned loopback port.
Custom tag emojis accept PNG, GIF, WebP, and JPEG images up to 1 MB and
256 × 256 pixels. They are assigned from the tag editor's emoji library; an
image cannot be deleted while a tag uses it. The browser commands continue to
use the `DATABASE_URL` configured for that environment.
