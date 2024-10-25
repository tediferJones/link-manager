// src/lib/utils.ts
function clearChildren(id) {
  const parent = document.querySelector(`#${id}`);
  if (!parent)
    throw Error(`failed to find parent container for given id: ${id}`);
  while (parent.firstChild)
    parent.removeChild(parent.firstChild);
  return parent;
}
function isFolder(item) {
  return "contents" in item;
}

// src/content.ts
console.log("this is the content script");
var observer = new MutationObserver((mutList) => {
  console.log(mutList);
  mutList.forEach((mutation) => {
    console.log(mutation.type);
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => {
        if (node.tagName === "VIDEO") {
          node.addEventListener("ended", () => {
            console.log("video has ended");
          });
        }
      });
    }
  });
});
observer.observe(document.body, { childList: true, subtree: true });
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message);
  sendResponse({ status: "Object received by content script" });
  window.location.assign(message.url);
});
