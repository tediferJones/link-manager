import t from '@/lib/getTag';
// import type { Vault } from '@/types';
import VaultManager from '@/lib/VaultManager';
import type { Vault } from './types';

// TO-DO
//
// Rotate salt and iv every time a folder is decrypted
// When adding or renaming, make sure new title does not already exist, or this will overwrite the previous entry
// Delete background script if its not actually needed
// Replace delete with function with method from VaultManager in renderFolder (and maybe renderLink too)

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
      t('div', { className: 'p-4' }, [
        t('form', { className: 'flex gap-2' }, [
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
            className: 'p-2 border-2 border-blue-600 rounded-xl',
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
        t('h1', {
          id: 'folderTitle',
          className: 'text-center',
          textContent: 'Home'
        }),
        t('div', { className: 'flex justify-center gap-4 text-2xl' }, [
          t('button', { textContent: '⏪' }),
          t('button', {
            textContent: '▶',
            onclick: () => {
              vaultMan.setPlaylist(vaultMan.currentLocation)
              // const startIndex = vaultMan.currentLocation.queueStart - 1;
              // const startKey = vaultMan.currentLocation.sortedKeys.links[startIndex];
              // const record = vaultMan.currentLocation.contents[startKey];
              // console.log(startIndex, startKey, record)
              // chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
              //   chrome.tabs.sendMessage(tabs[0].id!, record, (response) => {
              //     console.log("Object sent to content script:", response);
              //   });
              // });
            }
          }),
          t('button', { textContent: '⏩' }),
          t('button', {
            textContent: '🔄',
            onclick: () => {
              vaultMan.currentLocation.queueStart = 0
              vaultMan.saveAndRender();
            }
          })
        ]),
        t('div', { id: 'directoryContainer', className: 'flex flex-col gap-2 py-2' }, 
          Object.keys(vaultMan.vault.contents).length ? vaultMan.getVaultList()
            : [ t('div', {
              textContent: 'No vault found',
              className: 'p-4 text-center text-xl font-bold text-gray-500'
            }) ]
        )
      ])
    )
  });
})();
