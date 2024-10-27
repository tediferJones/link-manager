import type { Playlist, Record, Vault } from '@/types';
import { isFolder } from './lib/utils';

// Is tracking watch time really that important?  If we make it to the 'ended' event, we can mark it as watched
// Otherwise we should be focusing on getting queueing working

// let playing: Record;
console.log('this is the content script')
const observer = new MutationObserver((mutList) => {
  mutList.forEach(mutation => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        // @ts-ignore
        if (node.tagName === 'VIDEO') {
          console.log('found video container')
          node.addEventListener('ended', () => {
            // Send a message back to the main script, update queueStart there, and return next video
            console.log('video has ended')
            playNext(true)
          })
        }
      })
    }
  })
})
observer.observe(document.body, { childList: true, subtree: true });

async function playNext(increment = false) {
  // There is a lot that can go wrong here
  // 1.) How do we handle end of list, just stop playing?
  // 2.) the event listener is attached whenever a video element is loaded, which leads to problems if the user manually navigates away
  //     - e.x. user starts playlist, watches 2 videos, then manually navigates to a third, once this video ends, queuePos will be incremented and page will reload to the next next video in the queue

  const playlist: Playlist = (await chrome.storage.local.get('playlist') as any).playlist
  if (document.URL !== playlist.links[playlist.queuePos].url) return console.log('not on the right video')
  if (playlist.queuePos > playlist.links.length) {
    console.log('nothing to play')
    // Reset playlist to zero, or do something like that
    return
  }
  console.log('playNext func', playlist)
  if (increment) {
    playlist.queuePos++
    const vault: Vault = (await chrome.storage.local.get('vault') as any).vault
    const folder = playlist.keys.reduce((folder, key) => folder.contents[key] as Vault, vault)
    folder.queueStart = playlist.queuePos
    await chrome.storage.local.set({ vault })
  }

  const { links, queuePos } = playlist
  console.log(links, queuePos, links[queuePos])
  window.location.assign(links[queuePos - 1].url)
}

let playlist: Playlist;
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  console.log('this is the message', message)
  if (message === 'startPlaylist') {
    sendResponse({ status: 'success' });
    // playlist = (await chrome.storage.local.get('playlist') as any).playlist
    // console.log('this is the playlist:', playlist)
    playNext()
  }
});

// Establish a connection with the main script
// chrome.runtime.onConnect.addListener((port) => {
//   if (port.name === "main-script") {
//     console.log("Connected to main script");
// 
//     // Listen for messages from the main script
//     port.onMessage.addListener((message) => {
//       console.log("Message received from main script:", message);
// 
//       // Respond back through the port
//       port.postMessage({ response: "Hello from content script" });
//     });
//   }
// });

// WORKING
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   console.log(message)
//   sendResponse({ status: "Object received by content script" });
//   window.location.assign(message.url)
// });

// function vaultDfs(searchUrl: string, folder: Vault): Record | undefined {
//   console.log('dfs-ing')
//   return Object.values(folder.contents).find(item => {
//     return isFolder(item) ? vaultDfs(searchUrl, item) : searchUrl === item.url
//   }) as Record
// }
// 
// function startService({ vault }: any, attemptCount = 0) {
//   // All we want to do is mark a video as viewed when the 'ended' event is triggered
//   // and then, play the next video in the queue
//   console.log('attempting to find video container')
//   const videoContainer = document.querySelector('video')
//   if (!videoContainer) {
//     if (attemptCount > 10) return console.log('cant find video container')
//     return setTimeout(() => startService(attemptCount + 1), 1000)
//   }
//   console.log('found video container')
//   videoContainer.addEventListener('play', () => console.log('video play event'))
//   videoContainer.addEventListener('pause', () => console.log('video pause event'))
//   videoContainer.addEventListener('ended', () => console.log('video ended event'))
//   // chrome.storage.local.set({ vault })
// }

// This is so borked its not even funny, if you're reading this just delete everything and start over
// chrome.storage.local.get('vault').then(startService)

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
