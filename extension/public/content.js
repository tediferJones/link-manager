// src/content.ts
console.log("transpiled from TS");
console.log(document.title, document.URL);
chrome.storage.local.get(["vault"], (data) => {
  console.log("extension localstorage", data);
});
