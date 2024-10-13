// src/content.ts
var vaultDfs = function(searchUrl, folder) {
  console.log("dfs-ing");
  return Object.values(folder.contents).find((item) => {
    console.log("checking", item, searchUrl);
    if (item.contents)
      return vaultDfs(searchUrl, item);
    if (item.url)
      return searchUrl === item.url;
    console.log("is locked");
  });
};
console.log("transpiled from TS");
console.log(document.title, document.URL);
chrome.storage.local.get("vaultTest").then((data) => {
  console.log(JSON.parse(data.vaultTest));
  console.log("DFS result", vaultDfs(document.URL, JSON.parse(data.vaultTest)));
});
