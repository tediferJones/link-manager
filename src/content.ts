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
  const playlist: Playlist = (await chrome.storage.local.get('playlist') as any).playlist
  console.log('playNext func', playlist)
  if (increment) {
    const currentUrl = getUrlParam(document.URL, 'v');
    const queueUrl = getUrlParam(playlist.links[playlist.queuePos].url, 'v')
    console.log('url compare', currentUrl, queueUrl)
    if (currentUrl !== queueUrl) {
      // chrome.storage.local.remove('playlist')
      return console.log('not on the right video')
    }

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
