import type { Playlist, Record, Vault } from '@/types';

// Is tracking watch time really that important?  If we make it to the 'ended' event, we can mark it as watched
// Otherwise we should be focusing on getting queueing working


(async () => {
  chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log('this is the message', message)
    if (message === 'startPlaylist') {
      sendResponse({ status: 'success' });
      playNext()
    }
  });
  console.log('this is the content script')

  const playlist = (await chrome.storage.local.get('playlist')).playlist as Playlist;

  if (playlist) {
    // if (document.URL === playlist.links[playlist.queuePos].url) {
    //   chrome.storage.local.remove('playlist');
    //   return
    // }

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

              node.addEventListener('pause', async () => {
                const playlist: Playlist = (await chrome.storage.local.get('playlist') as any).playlist
                const vault: Vault = (await chrome.storage.local.get('vault') as any).vault
                const folder = playlist.keys.reduce((folder, key) => folder.contents[key] as Vault, vault)
                const record = folder.contents[searchFolder(folder) || ''] as Record
                if (record) {
                  record.totalTime = document.querySelector('.ytp-time-duration')?.textContent || undefined
                  record.currentTime = document.querySelector('.ytp-time-current')?.textContent || undefined
                  await chrome.storage.local.set({ vault })
                }
              })
            }
          })
        }
      })
    })
    observer.observe(document.body, { childList: true, subtree: true });
  }
})()

// const originalPushState = history.pushState;
// const originalReplaceState = history.replaceState;
// 
// history.pushState = function (...args) {
//     originalPushState.apply(this, args);
//     window.dispatchEvent(new Event('urlChange'));
// };
// 
// history.replaceState = function (...args) {
//     originalReplaceState.apply(this, args);
//     window.dispatchEvent(new Event('urlChange'));
// };
// 
// // Listen for custom urlChange event
// window.addEventListener('urlChange', () => {
//     console.log('URL changed (pushState or replaceState):', window.location.href);
// });

// // Triggered when history changes (for SPA navigation, back/forward actions)
// window.addEventListener('popstate', (event) => {
//     console.log('URL changed (popstate):', window.location.href);
// });
// 
// // Triggered when the URL hash changes
// window.addEventListener('hashchange', () => {
//     console.log('URL hash changed:', window.location.href);
// });

const observer = new MutationObserver(() => {
    console.log('URL or page content might have changed:', window.location.href);
});

observer.observe(document.querySelector('title')!, { subtree: true, characterData: true, childList: true });

// function getNewPromise() {
//   return new Promise<string>((resolve, reject) => {
//     setTimeout(() => {
//       console.log(document.URL)
//       resolve(document.URL)
//     }, 100)
//   })
// }
// async function watchUrl(promise: Promise<string>) {
//   await promise;
//   watchUrl(getNewPromise())
// }
// watchUrl(getNewPromise());

console.log('added urlChange event listener');

(async () => {
  const playlist: Playlist = (await chrome.storage.local.get('playlist') as any).playlist
  const vault: Vault = (await chrome.storage.local.get('vault') as any).vault
  const folder = playlist.keys.reduce((folder, key) => folder.contents[key] as Vault, vault)
  const record = folder.contents[searchFolder(folder) || '']
  console.log('this is the folder', folder)
  console.log('this is the record', record)
})();

function searchFolder(folder: Vault) {
  return Object.keys(folder.contents).find(record => {
    if ((folder.contents[record] as Record).url === document.URL) {
      return true
    }
  })
}

function getUrlParam(url: string, key: string) {
  const { searchParams } = new URL(url)
  return searchParams.get(key)
}

async function playNext(increment = false) {
  // There is a lot that can go wrong here
  // 1.) How do we handle end of list, just stop playing?
  // 2.) the event listener is attached whenever a video element is loaded, which leads to problems if the user manually navigates away
  //     - e.x. user starts playlist, watches 2 videos, then manually navigates to a third, once this video ends, queuePos will be incremented and page will reload to the next next video in the queue

  const playlist: Playlist = (await chrome.storage.local.get('playlist') as any).playlist
  // if (document.URL !== playlist.links[playlist.queuePos].url) return console.log('not on the right video')
  // if (playlist.queuePos > playlist.links.length) {
  //   console.log('nothing to play')
  //   // Reset playlist to zero, or do something like that
  //   return
  // }
  console.log('playNext func', playlist)
  if (increment) {
    const currentUrl = getUrlParam(document.URL, 'v');
    const queueUrl = getUrlParam(playlist.links[playlist.queuePos].url, 'v')
    console.log('url compare', currentUrl, queueUrl)
    if (currentUrl !== queueUrl) {
      // chrome.storage.local.remove('playlist')
      return console.log('not on the right video')
    }
    // if (document.URL !== playlist.links[playlist.queuePos - 1].url) return console.log('not on the right video')
    // playlist.queuePos = playlist.queuePos >= playlist.links.length ? 1 : playlist.queuePos + 1
    if (playlist.queuePos >= playlist.links.length - 1) {
      console.log('reset queuePos')
      playlist.queuePos = 0
    } else {
      playlist.queuePos++
      console.log('increment queuePos', playlist.queuePos)
    }
    const vault: Vault = (await chrome.storage.local.get('vault') as any).vault
    const folder = playlist.keys.reduce((folder, key) => folder.contents[key] as Vault, vault)
    console.log('folder is:', folder)
    folder.queueStart = playlist.queuePos

    const record = folder.contents[searchFolder(folder) || ''] as Record
    if (record) {
      record.totalTime = document.querySelector('.ytp-time-duration')?.textContent || undefined
      record.currentTime = document.querySelector('.ytp-time-current')?.textContent || undefined
    }

    await chrome.storage.local.set({ vault, playlist })
  }

  const { links, queuePos } = playlist
  console.log(links, queuePos, links[queuePos])
  window.location.assign(links[queuePos].url)
}
