console.log('Hello from the background')

// // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
// chrome.tabs.query({ active: true }, (tabs) => {
//   console.log(tabs.sort((b, a) => a.lastAccessed - b.lastAccessed)[0].url)
//   // let activeTab = tabs[0];
//   // console.log("URL of the active tab:", activeTab.url);
// });

let currentTab;

setInterval(() => {
  chrome.tabs.query({ active: true }, (tabs) => {
    // console.log(tabs.sort((b, a) => a.lastAccessed - b.lastAccessed)[0].url)
    currentTab = tabs.sort((b, a) => a.lastAccessed - b.lastAccessed)[0];
  });
  console.log(currentTab.url)
}, 1000)
