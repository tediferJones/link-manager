// src/background.ts
console.log("this is the background script");
chrome.runtime.onInstalled.addListener(() => {
});
chrome.contextMenus.create({
  id: "addToLinkManager",
  title: "Add to Link Manager",
  contexts: ["all"]
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "addToLinkManager") {
    console.log("Right-click on tab detected");
    chrome.windows.create({
      url: chrome.runtime.getURL("index.html"),
      type: "popup"
    });
  }
});
