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
var timeStampToSeconds = function(time) {
  return time.split(":").reverse().reduce((total, seg, i) => {
    return i === 0 ? Number(seg) : total + Number(seg) * 60 ** i;
  }, 0);
};
var setWatchTime = function(entry) {
  console.log("current time", document.querySelector(".ytp-time-current")?.textContent, "total time", document.querySelector(".ytp-time-duration")?.textContent);
  entry.totalTime = timeStampToSeconds(document.querySelector(".ytp-time-duration")?.textContent || "");
  entry.currentTime = timeStampToSeconds(document.querySelector(".ytp-time-current")?.textContent || "");
};
var timeoutTest;
chrome.storage.local.get("vault").then(({ vault }) => {
  const foundEntry = vaultDfs(document.URL, vault);
  console.log("DFS result", foundEntry);
  if (foundEntry) {
    foundEntry.viewCount++;
    if (document.URL.match("^https?://www.youtube.com")) {
      if (timeoutTest) {
        clearTimeout(timeoutTest);
        console.log("clearing timeout");
      }
      console.log("setting timeout");
      setTimeout(() => {
        console.log("is youtube link, attaching listeners");
        window.navigation.addEventListener("navigate", () => {
          console.log("navigation done navigated");
          setWatchTime(foundEntry);
          console.log("set", foundEntry);
        });
        document.querySelector("video")?.addEventListener("pause", () => {
          console.log("paused, update current time stamp");
          setWatchTime(foundEntry);
          console.log("set", foundEntry);
        });
        console.log("done");
      }, 1000);
    }
    chrome.storage.local.set({ vault });
  }
});
