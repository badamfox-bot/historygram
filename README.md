# Historygram

Turns your browser history into a shareable "portrait" — a downloadable image summarizing how you browse: top sites, busiest hours, and a personality tag like *"Night Owl Builder"* or *"Early Bird Scroller."*

## Why a browser extension?

Websites can't read your browsing history — modern browsers deliberately block that (it used to be possible via a CSS `:visited` trick and got patched everywhere around 2010-2013). The only legitimate way to access it is with your explicit, revocable consent via the browser's extension permission system. So Historygram is a real browser extension (Chrome and Firefox both work off the same code): it asks for the `history` permission, reads your history locally on your machine, and never sends your raw browsing data anywhere — the portrait image is generated entirely on your device.

## Project layout

- `extension/` — the WebExtension (Manifest V3), works in both Chrome and Firefox. Reads history locally and renders the portrait to a `<canvas>`, exportable as a PNG.
- `docs/` — a small static landing page (deployed via GitHub Pages) explaining the project, how to install it, and a demo gallery cycling through every category's mascot with fake example data.

`docs/categories.js` and `docs/mascot.js` are copies of the files in `extension/` — GitHub Pages only serves the `docs/` folder, and a browser extension can't load files from outside its own package, so there's no way to share one copy between them without a build step. **If you change the mascot or category logic in `extension/`, copy the same change into `docs/`** or the landing-page demo will drift out of sync with the real extension.

## Installing (not yet store-published)

### Chrome
1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** and select the `extension/` folder
4. Click the Historygram icon in your toolbar → **Generate My Portrait**

### Firefox
1. Go to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on…**
3. Select the `extension/manifest.json` file (not the folder)
4. Click the Historygram icon in your toolbar → **Generate My Portrait**

Note: Firefox's "temporary" add-ons are removed when Firefox restarts — you'll need to reload it each session until it's signed/published.

## Privacy

All processing happens locally in your browser. Historygram makes no network requests and does not transmit your history anywhere.
