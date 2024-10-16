import t from '@/lib/getTag';
// import type { Vault } from '@/types';
import VaultManager from '@/lib/VaultManager';

// TO-DO
//
// Rotate salt and iv every time a folder is decrypted
// When adding or renaming, make sure new title does not already exist, or this will overwrite the previous entry
// Delete public/background.js if its not actually needed
// Transition to use chrome.storage.local instead of localstorage
//  - this allows a single source of truth between the extension and content script
// We want to implement queueing for all links in the same folder

// console.log('chrome storage', chrome.storage.local.get('vaultTest').then(data => console.log(data)))

// const vault: Vault = window.localStorage.getItem('vault') ? JSON.parse(window.localStorage.getItem('vault')!) : { contents: {} };
// const vaultMan = new VaultManager(vault)

(async () => {
  const vaultMan = new VaultManager(
    (await chrome.storage.local.get('vault')).vault || { contents: {} }
  )
  console.log(vaultMan.vault)

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
              const title = (document.querySelector('#title') as HTMLInputElement).value;
              vaultMan.addFolder({ title })
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
