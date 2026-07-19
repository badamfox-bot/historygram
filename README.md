# Historygram

Turns your browser history into a shareable "portrait" — a downloadable image summarizing how you browse: top sites, busiest hours, and a personality tag like *"Night Owl Builder"* or *"Early Bird Scroller."*

## Why a browser extension?

Websites can't read your browsing history — modern browsers deliberately block that (it used to be possible via a CSS `:visited` trick and got patched everywhere around 2010-2013). The only legitimate way to access it is with your explicit, revocable consent via the browser's extension permission system. So Historygram is a real Chrome extension: it asks for the `history` permission, reads your history locally on your machine, and never sends your raw browsing data anywhere — the portrait image is generated entirely on your device.

## Project layout

- `extension/` — the Chrome extension (Manifest V3). Reads `chrome.history` locally and renders the portrait to a `<canvas>`, exportable as a PNG.
- `site/` — a small static landing page (deployed via GitHub Pages) explaining the project and how to install it.

## Installing (unpacked, for now)

Not yet published to the Chrome Web Store. To try it locally:

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked** and select the `extension/` folder
4. Click the Historygram icon in your toolbar → **Generate My Portrait**

## Privacy

All processing happens locally in your browser. Historygram makes no network requests and does not transmit your history anywhere.
