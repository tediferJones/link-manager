// src/content.ts
var searchFolder = function(folder) {
  return Object.keys(folder.contents).find((record) => {
    if (folder.contents[record].url === document.URL) {
      return true;
    }
  });
};
var getUrlParam = function(url, key) {
  const { searchParams } = new URL(url);
  return searchParams.get(key);
};
async function playNext(increment = false) {
  const playlist = (await chrome.storage.local.get("playlist")).playlist;
  console.log("playNext func", playlist);
  if (increment) {
    const currentUrl = getUrlParam(document.URL, "v");
    const queueUrl = getUrlParam(playlist.links[playlist.queuePos].url, "v");
    console.log("url compare", currentUrl, queueUrl);
    if (currentUrl !== queueUrl) {
      return console.log("not on the right video");
    }
    if (playlist.queuePos >= playlist.links.length - 1) {
      console.log("reset queuePos");
      playlist.queuePos = 0;
    } else {
      playlist.queuePos++;
      console.log("increment queuePos", playlist.queuePos);
    }
    const vault = (await chrome.storage.local.get("vault")).vault;
    const folder = playlist.keys.reduce((folder2, key) => folder2.contents[key], vault);
    console.log("folder is:", folder);
    folder.queueStart = playlist.queuePos;
    const record = folder.contents[searchFolder(folder) || ""];
    if (record) {
      record.totalTime = document.querySelector(".ytp-time-duration")?.textContent || undefined;
      record.currentTime = document.querySelector(".ytp-time-current")?.textContent || undefined;
    }
    await chrome.storage.local.set({ vault, playlist });
  }
  const { links, queuePos } = playlist;
  console.log(links, queuePos, links[queuePos]);
  window.location.assign(links[queuePos].url);
}
(async () => {
  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log("this is the message", message);
    if (message === "startPlaylist") {
      sendResponse({ status: "success" });
      playNext();
    }
  });
  console.log("this is the content script");
  const playlist = (await chrome.storage.local.get("playlist")).playlist;
  if (playlist) {
    const observer = new MutationObserver((mutList) => {
      mutList.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.tagName === "VIDEO") {
              console.log("found video container");
              node.addEventListener("ended", () => {
                console.log("video has ended");
                playNext(true);
              });
              node.addEventListener("pause", async () => {
                const playlist2 = (await chrome.storage.local.get("playlist")).playlist;
                const vault = (await chrome.storage.local.get("vault")).vault;
                const folder = playlist2.keys.reduce((folder2, key) => folder2.contents[key], vault);
                const record = folder.contents[searchFolder(folder) || ""];
                if (record) {
                  record.totalTime = document.querySelector(".ytp-time-duration")?.textContent || undefined;
                  record.currentTime = document.querySelector(".ytp-time-current")?.textContent || undefined;
                  await chrome.storage.local.set({ vault });
                }
              });
            }
          });
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
var observer = new MutationObserver(() => {
  console.log("URL or page content might have changed:", window.location.href);
});
observer.observe(document.querySelector("title"), { subtree: true, characterData: true, childList: true });
console.log("added urlChange event listener");
(async () => {
  const playlist = (await chrome.storage.local.get("playlist")).playlist;
  const vault = (await chrome.storage.local.get("vault")).vault;
  const folder = playlist.keys.reduce((folder2, key) => folder2.contents[key], vault);
  const record = folder.contents[searchFolder(folder) || ""];
  console.log("this is the folder", folder);
  console.log("this is the record", record);
})();
