// src/content.ts
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
    folder.queueStart = playlist.queuePos;
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
            }
          });
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
