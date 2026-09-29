# Application icons

These platform icons are generated from the original user-supplied
`DeltaSymbol.png` without redrawing or recoloring it:

- `icon.png` - PNG used by Linux packages and the Electron Linux window.
- `icon.ico` - multi-size PNG-backed ICO used by Windows packages, windows, and tray.
- `icon.icns` - multi-size PNG-backed ICNS used by macOS packages.

The browser favicon is `src/app/favicon.ico`; the source logo displayed in the
shared navigation and home page is `public/images/utg-logo.png`. Electron
Builder's `win`, `mac`, and `linux` icon options in `package.json` point to the
corresponding files here.