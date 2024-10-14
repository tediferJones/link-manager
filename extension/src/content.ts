import { isFolder, type Record, type Vault } from '@/types';

function vaultDfs(searchUrl: string, folder: Vault): Record | undefined {
  console.log('dfs-ing')
  return Object.values(folder.contents).find(item => {
    return isFolder(item) ? vaultDfs(searchUrl, item) : searchUrl === item.url
  }) as Record
}

chrome.storage.local.get('vault').then(({ vault }) => {
  const foundEntry = vaultDfs(document.URL, vault)
  console.log('DFS result', foundEntry)
  if (foundEntry) {
    foundEntry.viewCount++
    if (document.URL.match('^https?://www.youtube.com')) {
      // if it's a youtube link, track current watch time and total watch time
      // See if we can hook into a pause event and URL change event
      // currentTime only needs to be updated when the video is paused, or navigated away from (tab closes, user clicks on different video, etc...)
      // console.log('window.navigation', window.navigation)

      // @ts-ignore
      window.navigation.addEventListener('navigate', () => {
        console.log('navigation done navigated')
      })
    }
    chrome.storage.local.set({ vault })
  }
})

