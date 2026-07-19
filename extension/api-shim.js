// Firefox exposes the promise-based `browser` namespace natively.
// Chrome's `chrome` namespace also returns promises (MV3) when no callback is passed.
const api = typeof browser !== "undefined" ? browser : chrome;
