import t from '@/lib/getTag';
// import type { Vault } from '@/types';
import VaultManager from '@/lib/VaultManager';

// TO-DO
//
// Rotate salt and iv every time a folder is decrypted
// When adding or renaming, make sure new title does not already exist, or this will overwrite the previous entry
// Delete background script if its not actually needed
// Transition to use chrome.storage.local instead of localstorage
//  - this allows a single source of truth between the extension and content script
// We want to implement queueing for all links in the same folder
//  - First make the sorting function:
//    - In theory we only need to sort when we add or rename something
//    - Sorted order can be stored in the folder obj (next to contents and locked) as { folders: [keys in alphabetical order], links [keys in order by queue number] }
// Should probably redesign how we render folders
//  - get rid of cascading drop downs and this goofy folder tracking
//  - only render a single folder at a time, use the up arrow thing to navigate to parent folder
// Replace delete with function with method from VaultManager in renderFolder (and maybe renderLink too)

// console.log('chrome storage', chrome.storage.local.get('vaultTest').then(data => console.log(data)))

// const vault: Vault = window.localStorage.getItem('vault') ? JSON.parse(window.localStorage.getItem('vault')!) : { contents: {} };
// const vaultMan = new VaultManager(vault)

let vaultTest;
(async () => {
  const vaultMan = new VaultManager(
    (await chrome.storage.local.get('vault')).vault || { contents: {} }
  )
  vaultTest = vaultMan
  console.log('vault from index.js', vaultMan.vault)

  document.body.appendChild(
    t('h1', { textContent: 'LINK MANAGER', className: 'p-4 text-center text-2xl font-bold text-blue-500' })
  )

  chrome.tabs.query({ active: true }, (tabs) => {
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
