console.log('this is the background script')
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
