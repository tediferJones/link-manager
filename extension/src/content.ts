import { isFolder, type Record, type Vault } from '@/types';

function vaultDfs(searchUrl: string, folder: Vault): Record | undefined {
  console.log('dfs-ing')
  return Object.values(folder.contents).find(item => {
    return isFolder(item) ? vaultDfs(searchUrl, item) : searchUrl === item.url
  }) as Record
}

function timeStampToSeconds(time: string) {
  return time.split(':').reverse().reduce((total, seg, i) => {
    return i === 0 ? Number(seg) : total + Number(seg) * (60 ** i)
  }, 0)
}

function setWatchTime(entry: Record) {
  console.log(
    'current time', document.querySelector('.ytp-time-current')?.textContent,
    'total time', document.querySelector('.ytp-time-duration')?.textContent
  )
  entry.totalTime = timeStampToSeconds(
    document.querySelector('.ytp-time-duration')?.textContent || ''
  )
  entry.currentTime = timeStampToSeconds(
    document.querySelector('.ytp-time-current')?.textContent || ''
  )
}

let timeoutTest: Timer;

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

      if (timeoutTest) {
        clearTimeout(timeoutTest)
        console.log('clearing timeout')
      }
      console.log('setting timeout')
      setTimeout(() => {
        console.log('is youtube link, attaching listeners')
        // @ts-ignore
        window.navigation.addEventListener('navigate', () => {
          console.log('navigation done navigated')
          setWatchTime(foundEntry)
          console.log('set', foundEntry)
        })

        document.querySelector('video')?.addEventListener('pause', () => {
          console.log('paused, update current time stamp')
          setWatchTime(foundEntry)
          console.log('set', foundEntry)
        })

        console.log('done')
      }, 1000)
    }
    chrome.storage.local.set({ vault })
  }
})
