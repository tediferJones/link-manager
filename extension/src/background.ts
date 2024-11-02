console.log('this is the background script')

// Handle context menus
// This requires "contextMenus" to be in the "permissions" array in our manifest.json
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "yourFunction",
    title: "Add this page to Link Manager",
    contexts: ["all"]  // Can also use "page", "selection", "image", "link", etc.
  });
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "yourTabFunction") {
    // Perform action on the tab itself
    console.log("Right-click on tab detected");
    // myTabFunction(tab); // Call your custom function with the tab object
  }
});

// console.log(localStorage)
// console.log(window, localStorage)

// Listen for messages from the content script
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log('got message', window)
//   sendResponse({ idk: 'wow' })
//   // if (message.action === "getLocalStorage") {
//   //   const storedValue = localStorage.getItem("vault");
//   //   sendResponse({ value: storedValue });
//   // }
// });
