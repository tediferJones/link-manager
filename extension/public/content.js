// src/types.ts
function isFolder(item) {
  return "contents" in item;
}

// src/content.ts
var vaultDfs = function(searchUrl, folder) {
  console.log("dfs-ing");
  return Object.values(folder.contents).find((item) => {
    return isFolder(item) ? vaultDfs(searchUrl, item) : searchUrl === item.url;
  });
};
chrome.storage.local.get("vault").then(({ vault }) => {
  const foundEntry = vaultDfs(document.URL, vault);
  console.log("DFS result", foundEntry);
  if (foundEntry) {
    foundEntry.viewCount++;
    if (document.URL.match("^https?://www.youtube.com")) {
      window.navigation.addEventListener("navigate", () => {
        console.log("navigation done navigated");
      });
    }
    chrome.storage.local.set({ vault });
  }
});
