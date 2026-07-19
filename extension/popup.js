document.getElementById("generate").addEventListener("click", () => {
  api.tabs.create({ url: api.runtime.getURL("portrait.html") });
});
