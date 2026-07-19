document.getElementById("generate").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("portrait.html") });
});
