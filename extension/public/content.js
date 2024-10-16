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
var attachListeners = function(vault, entry, attemptCount = 0) {
  console.log("attempting to find video container");
  const videoContainer = document.querySelector("video");
  if (!videoContainer) {
    if (attemptCount > 10)
      return console.log("cant find video container");
    return setTimeout(() => attachListeners(vault, entry, attemptCount + 1), 1000);
  }
  console.log("found video container");
  videoContainer.addEventListener("play", () => {
    console.log("video play event");
  });
  videoContainer.addEventListener("pause", () => {
    console.log("video pause event");
    setWatchTime(entry);
    console.log("set", entry);
    chrome.storage.local.set({ vault });
  });
  videoContainer.addEventListener("change", () => {
    console.log("video change event");
  });
  videoContainer.addEventListener("DOMContentLoaded", () => {
    console.log("video DOMContentLoaded");
  });
  videoContainer.addEventListener("ended", () => console.log("video ended event"));
  videoContainer.addEventListener("yt-navigate", () => console.log("video yt-navigate event"));
  videoContainer.addEventListener("yt-navigate-finish", () => console.log("video yt-navigate-finish event"));
  if (videoContainer) {
    const observer = new MutationObserver((mutationsList) => {
      for (const mutation of mutationsList) {
        if (mutation.type === "attributes" && mutation.attributeName === "src") {
          console.log("Video source changed:", mutation.target.src);
        }
      }
    });
    observer.observe(videoContainer, { attributes: true });
  } else {
    console.log("No video element found");
  }
};
chrome.storage.local.get("vault").then(({ vault }) => {
  const foundEntry = vaultDfs(document.URL, vault);
  console.log("DFS result", foundEntry);
  if (foundEntry) {
    foundEntry.viewCount++;
    if (document.URL.match("^https?://www.youtube.com")) {
      attachListeners(vault, foundEntry);
    }
  }
});
