import t from '@/lib/getTag';
import VaultManager from '@/lib/VaultManager';
import type { Vault } from '@/types';

// TO-DO
//
// Rotate salt and iv every time a folder is decrypted
// When adding or renaming, make sure new title does not already exist, or this will overwrite the previous entry
// Delete background script if its not actually needed
// Replace delete with function with method from VaultManager in renderFolder (and maybe renderLink too)
// Ideally, we want to navigate between youtube pages without doing a full page refresh, this would eliminate a lot of problems
//  - For example: if the current video saved to chrome.storage.local.playlist is navigated to manually, the playlist will automatically pick up when the video ends

let vaultTest;
(async () => {
  const vaultMan = new VaultManager(
    // (await chrome.storage.local.get('vault')).vault || { contents: {} }
    (await chrome.storage.local.get('vault')).vault || {
      contents: {},
      title: 'Home',
      queueStart: 1,
      sortedKeys: {
        folders: [],
        links: []
      }
    } satisfies Omit<Vault, 'parent'>
  )
  vaultTest = vaultMan
  console.log('vault from index.js', vaultMan.vault)

  document.body.appendChild(
    t('h1', { textContent: 'LINK MANAGER', className: 'p-4 text-center text-2xl font-bold text-blue-500' })
  )

  // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  //   let port = chrome.tabs.connect(tabs[0].id!, { name: "main-script" });

  //   // Send a message through the port
  //   port.postMessage({ greeting: "Hello from main script" });

  //   // Listen for messages from the content script
  //   port.onMessage.addListener((message) => {
  //     console.log("Message received from content script:", message);
  //   });
  // });

  // chrome.tabs.query({ active: true }, (tabs) => {
  // Try this to better detect active window
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const currentTab = (
      tabs
      .filter(tab => tab.lastAccessed)
      .sort((b, a) => a.lastAccessed! - b.lastAccessed!)[0]
    );
    document.body.append(
      t('div', { className: 'px-4 flex flex-col gap-2 w-[360px]' }, [
        t('form', { className: 'flex gap-2 m-0' }, [
          t('button', {
            className: 'p-2 border-2 border-blue-600 rounded-xl',
            textContent: '⬆︎',
            onclick: (e) => {
              e.preventDefault();
              console.log('go to parent dir')
              console.log(vaultMan.currentLocation)
              if (vaultMan.currentLocation.parent) {
                vaultMan.currentLocation = vaultMan.currentLocation.parent
                vaultMan.render()
              }
              // if (vaultMan.parentLocation) vaultMan.currentLocation = vaultMan.parentLocation
              // vaultMan.render()
            }
          }),
          t('input', {
            className: 'w-full p-2 rounded-xl border-2 border-blue-600',
            value: currentTab.title,
            required: true,
            id: 'title',
          }),
          t('button', {
            className: 'p-2 rounded-xl border-2 border-blue-600',
            textContent: '＋',
            type: 'submit',
            onclick: (e) => {
              e.preventDefault()
              console.log('add link')
              const title = (document.querySelector('#title') as HTMLInputElement)?.value;
              const { url } = currentTab
              if (title && url) vaultMan.addLink({ title, url })
            }
          }),
          t('button', {
            className: 'p-2 rounded-xl border-2 border-blue-600',
            textContent: '📁',
            type: 'submit',
            onclick: (e) => {
              e.preventDefault()
              console.log('add folder')
              const title = (document.querySelector('#title') as HTMLInputElement).value;
              vaultMan.addFolder({ title })
            }
          })
        ]),
        t('div', { className: 'flex flex-wrap justify-around items-center p-2 border-2 border-gray-300 rounded-xl' }, [
          t('h1', { id: 'folderTitle', className: 'text-center text-lg font-bold' }),
          t('div', { id: 'queueController' }),
        ]),
        t('div', { id: 'directoryContainer', className: 'flex flex-col gap-2 bg-gray-200 p-2 rounded-xl' }),
      ])
    )
    vaultMan.render();
  });
})();
