# RP Cataloger

RP Cataloger is a Next.js application with an Electron desktop wrapper. The
browser-based development and production commands remain available alongside
the desktop app.

## Browser app

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. For a production browser server, run
`npm run build` followed by `npm run start`. Set `DATABASE_URL` in `.env` to a
writable SQLite database before using the API.

## Electron desktop app

Run `npm run electron:dev` to open the desktop wrapper against the Next.js
development server. Create a production installer for the current platform
with `npm run electron:build`, or use `npm run electron:build:win`,
`npm run electron:build:mac`, or `npm run electron:build:linux` to target a
specific platform.

The installer includes the production Next.js server and API routes; it does
not use a static export. On first launch, Prisma applies packaged migrations
and stores the SQLite database in Electron's per-user `userData` directory.
The desktop server listens only on a dynamically assigned loopback port. The
browser commands continue to use the `DATABASE_URL` configured for that
environment.
