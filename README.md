# UTG Catalog

UTG Catalog is a Next.js application with an Electron desktop wrapper. The
browser-based development and production commands remain available alongside
the desktop app. Its interface uses the bundled DTM Mono font, a black canvas,
and two layered pixel grids that drift continuously in opposite diagonal
directions without depending on scrolling. Grid animation respects reduced
motion preferences. Controls use orange `#FF7F27`; hover and keyboard focus
keep black backgrounds while highlighting borders and text in yellow
`#FFFF00`. Selecting a button replaces its icon with the Individuality soul.
The home menu uses compact destination buttons with local iconography. The supplied individuality and
soul-trait artwork is bundled locally; no visual assets are fetched from
third-party services. The soul-trait sprites for Individuality,
Patience, Bravery, Integrity, Perseverance, Kindness, and Justice preserve the
original pixel art and are used in character selection, stats, list, detail,
and graph views.

Content cards, dialogs, and page-state callouts use the supplied nine-piece
pixel frame under `public/images/text-box/`. The reusable `.tile-panel` surface
keeps each 59×56 corner at native size and repeats edge and fill sprites across
larger panels; controls and other non-panel surfaces remain black with white
outlines.

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

The installer is presented as UTG Catalog and includes the production Next.js
server and API routes; it does not use a static export. On first launch, Prisma
applies packaged migrations and stores the SQLite database in Electron's
per-user `userData` directory.
The desktop server listens only on a dynamically assigned loopback port.
Custom emojis accept PNG, GIF, WebP, and JPEG images up to 1 MB and
256 × 256 pixels, with a library limit of 250 images. Open the smile button
beside a text field to upload an emoji or insert one from the library. Give it
a name using letters, numbers, underscores, or hyphens (up to 32 characters),
then type its shortcode, such as `:sparkles:`, anywhere in a submission. Saved
shortcodes display as the uploaded image in character, item, and ability views.
The same library can assign emojis to tags; images and library entries persist
in local app data.
The browser commands continue to use the `DATABASE_URL` configured for that
environment.

## Windows updates

Packaged Windows builds check the GitHub Releases update feed when the app
starts and every six hours. The tray menu also has **Check for Updates**. New
versions download in the background; when the download finishes, the app offers
to restart and install it. If you choose Later, it installs the next time you
close the app.

The release workflow runs when a `v*` version tag is pushed. It builds the
Windows installer and creates a draft GitHub release for review. Publish that
draft from the repository's Releases page to make the update available. Keep
the tag version in sync with `package.json`. GitHub must be the project's
repository origin so electron-builder can write the correct update feed into
the installer. Install the first release built with this updater manually;
installers made before the update feed was configured cannot update themselves.

## Graph links

The Graph View connects characters, items, and abilities. Write an internal
link such as `[[Ralsei]]` in a text field to connect that entry to the matching
catalog entry; character aliases are also recognized. You can also drag from
one entry to another in the graph to save a link. Click an entry node to open
its page, click a tag node to filter by that tag, or select a saved link and
press Delete to remove it. Existing equipment, ownership, main-ability, and
parent-ability references appear as links too.

Catalog entries remain structured records in SQLite rather than individual
Markdown files. The `[[Name]]` syntax is used to build graph links; it does not
turn the catalog into a file-based Obsidian vault.
