import { isFolder, type Record, type Vault } from '@/types';

// Is tracking watch time really that important?  If we make it to the 'ended' event, we can mark it as watched
// Otherwise we should be focusing on getting queueing working

function vaultDfs(searchUrl: string, folder: Vault): Record | undefined {
  console.log('dfs-ing')
  return Object.values(folder.contents).find(item => {
    return isFolder(item) ? vaultDfs(searchUrl, item) : searchUrl === item.url
  }) as Record
}

function startService({ vault }: any, attemptCount = 0) {
  // All we want to do is mark a video as viewed when the 'ended' event is triggered
  // and then, play the next video in the queue
  console.log('attempting to find video container')
  const videoContainer = document.querySelector('video')
  if (!videoContainer) {
    if (attemptCount > 10) return console.log('cant find video container')
    return setTimeout(() => startService(attemptCount + 1), 1000)
  }
  console.log('found video container')
  videoContainer.addEventListener('play', () => console.log('video play event'))
  videoContainer.addEventListener('pause', () => console.log('video pause event'))
  videoContainer.addEventListener('ended', () => console.log('video ended event'))
  // chrome.storage.local.set({ vault })
}

chrome.storage.local.get('vault').then(startService)

// function timeStampToSeconds(time: string) {
//   return time.split(':').reverse().reduce((total, seg, i) => {
//     return i === 0 ? Number(seg) : total + Number(seg) * (60 ** i)
//   }, 0)
// }
// 
// function setWatchTime(entry: Record) {
//   console.log(
//     'current time', document.querySelector('.ytp-time-current')?.textContent,
//     'total time', document.querySelector('.ytp-time-duration')?.textContent
//   )
//   entry.totalTime = timeStampToSeconds(
//     document.querySelector('.ytp-time-duration')?.textContent || ''
//   )
//   entry.currentTime = timeStampToSeconds(
//     document.querySelector('.ytp-time-current')?.textContent || ''
//   )
// }
// 
// function afterNav() {
//   console.log('final', document.URL)
// }
// 
// let navTimeout: Timer;
// // @ts-ignore
// window.navigation.addEventListener('navigate', () => {
//   if (navTimeout) clearTimeout(navTimeout)
//   navTimeout = setTimeout(afterNav, 100)
// })

// let timeoutTest: Timer;
// 
// function attachListeners(vault: Vault, entry: Record, attemptCount = 0) {
//   // We need to save timestamp if user navigates to a different page
//   // currently this function does not do that
// 
//   console.log('attempting to find video container')
//   const videoContainer = document.querySelector('video')
//   if (!videoContainer) {
//     if (attemptCount > 10) return console.log('cant find video container')
//     return setTimeout(() => attachListeners(vault, entry, attemptCount + 1), 1000)
//     // return attachListeners(entry, attemptCount + 1)
//   }
//   console.log('found video container')
//   let lastTime;
//   let currentTime;
//   videoContainer.addEventListener('play', () => {
//     console.log('video play event')
//   })
//   videoContainer.addEventListener('pause', () => {
//     console.log('video pause event')
//     setWatchTime(entry)
//     console.log('set', entry)
//     chrome.storage.local.set({ vault })
//   })
//   // @ts-ignore
//   // window.navigation.addEventListener('navigate', () => {
//   //   console.log('navigated to', document.URL)
//   // })
//   // Apparently, none of these do fucking anything
//   // videoContainer.addEventListener('change', () => {
//   //   console.log('video change event')
//   // })
//   // videoContainer.addEventListener('DOMContentLoaded', () => {
//   //   console.log('video DOMContentLoaded')
//   // })
//   // videoContainer.addEventListener('ended', () => console.log('video ended event'))
//   // videoContainer.addEventListener('yt-navigate', () => console.log('video yt-navigate event'))
//   // videoContainer.addEventListener('yt-navigate-finish', () => console.log('video yt-navigate-finish event'))
//   // videoContainer.addEventListener('load', () => console.log('video load event'))
//   // videoContainer.addEventListener('beforeunload', () => console.log('video beforeunload event'))
//   // document.addEventListener('beforeunload', () => console.log('video beforeunload event'))
//   // chrome.webNavigation.onHistoryStateUpdated.addListener(() => console.log('chrome history state updated'))
// 
//   // if (videoContainer) {
//   //   // Create a MutationObserver instance to detect changes in the 'src' attribute
//   //   const observer = new MutationObserver((mutationsList) => {
//   //     for (const mutation of mutationsList) {
//   //       if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
//   //         // @ts-ignore
//   //         console.log('Video source changed:', mutation.target.src);
//   //         console.log(
//   //           'current time', document.querySelector('.ytp-time-current')?.textContent,
//   //         )
//   //         // You can trigger your action here when the video source changes
//   //       }
//   //     }
//   //   });
// 
//   //   // Start observing the video element for attribute changes (specifically 'src')
//   //   observer.observe(videoContainer, { attributes: true });
//   // } else {
//   //   console.log('No video element found');
//   // }
// }
// 
// chrome.storage.local.get('vault').then(({ vault }) => {
//   const foundEntry = vaultDfs(document.URL, vault)
//   console.log('DFS result', foundEntry)
//   if (foundEntry) {
//     foundEntry.viewCount++
//     if (document.URL.match('^https?://www.youtube.com')) {
//       // if it's a youtube link, track current watch time and total watch time
//       // See if we can hook into a pause event and URL change event
//       // currentTime only needs to be updated when the video is paused, or navigated away from (tab closes, user clicks on different video, etc...)
//       // console.log('window.navigation', window.navigation)
// 
//       // if (timeoutTest) {
//       //   clearTimeout(timeoutTest)
//       //   console.log('clearing timeout')
//       // }
//       // console.log('setting timeout')
// 
//       // setTimeout(() => {
//       //   console.log('is youtube link, attaching listeners')
//       //   // @ts-ignore
//       //   window.navigation.addEventListener('navigate', () => {
//       //     // console.log('navigation done navigated')
//       //     console.log('navigated', document.URL)
//       //     // setWatchTime(foundEntry)
//       //     // console.log('set', foundEntry)
//       //   })
// 
//       //   document.querySelector('video')?.addEventListener('pause', () => {
//       //     console.log('paused, update current time stamp')
//       //     setWatchTime(foundEntry)
//       //     console.log('set', foundEntry)
//       //   })
// 
//       //   console.log('done')
//       // }, 1000)
//       attachListeners(vault, foundEntry)
//     }
// 
//     // chrome.storage.local.set({ vault })
//   }
// })
