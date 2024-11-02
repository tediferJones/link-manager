// src/background.ts
console.log("this is the background script");
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "yourFunction",
    title: "Add this page to Link Manager",
    contexts: ["all"]
  });
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "yourTabFunction") {
    console.log("Right-click on tab detected");
  }
});
