// src/content.ts
async function playNext(increment = false) {
  const playlist = (await chrome.storage.local.get("playlist")).playlist;
  if (document.URL !== playlist.links[playlist.queuePos].url)
    return console.log("not on the right video");
  if (playlist.queuePos > playlist.links.length) {
    console.log("nothing to play");
    return;
  }
  console.log("playNext func", playlist);
  if (increment) {
    playlist.queuePos++;
    const vault = (await chrome.storage.local.get("vault")).vault;
    const folder = playlist.keys.reduce((folder2, key) => folder2.contents[key], vault);
    folder.queueStart = playlist.queuePos;
    await chrome.storage.local.set({ vault });
  }
  const { links, queuePos } = playlist;
  console.log(links, queuePos, links[queuePos]);
  window.location.assign(links[queuePos - 1].url);
}
console.log("this is the content script");
var observer = new MutationObserver((mutList) => {
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
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log("this is the message", message);
  if (message === "startPlaylist") {
    sendResponse({ status: "success" });
    playNext();
  }
});
