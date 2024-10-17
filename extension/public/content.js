// src/types.ts
function isFolder(item) {
  return "contents" in item;
}

// src/content.ts
var startService = function({ vault }, attemptCount = 0) {
  console.log("attempting to find video container");
  const videoContainer = document.querySelector("video");
  if (!videoContainer) {
    if (attemptCount > 10)
      return console.log("cant find video container");
    return setTimeout(() => startService(attemptCount + 1), 1000);
  }
  console.log("found video container");
  videoContainer.addEventListener("play", () => console.log("video play event"));
  videoContainer.addEventListener("pause", () => console.log("video pause event"));
  videoContainer.addEventListener("ended", () => console.log("video ended event"));
};
chrome.storage.local.get("vault").then(startService);
