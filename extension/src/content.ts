import VaultManager from "@/lib/VaultManager";
import type { Record, Vault } from "@/types";

console.log('transpiled from TS')

// const vault: Vault = window.localStorage.getItem('vault') ? JSON.parse(window.localStorage.getItem('vault')!) : { contents: {} };
// const vaultMan = new VaultManager(vault)

console.log(document.title, document.URL)
chrome.storage.local.get(['vault'], (data) => {
  console.log('extension localstorage', data)
})

// function vaultDfs(searchUrl: string, folder: Vault = vault): any {
//   // return Object.keys(folder.contents).find(key => {
//   //   const item = folder.contents[key]
//   //   if ((item as Vault).contents) return vaultDfs(searchUrl, item as Vault)
//   //   if ((item as Record).url) return (item as Record).url === searchUrl
//   // })
//   console.log('dfs-ing')
//   return Object.values(folder.contents).find(item => {
//     console.log('checking', item, searchUrl)
//     // @ts-ignore
//     if (item.contents) return vaultDfs(searchUrl, item)
//     // @ts-ignore
//     if (item.url) return searchUrl === item.url
//     console.log('is locked')
//   })
// }
// 
// if (document.URL.match('^https?://www.youtube.com')) {
//   // see if url exists anywhere in vault (do depth first search), ignore locked folders
//   console.log('DFS result', vaultDfs(document.URL))
// }
