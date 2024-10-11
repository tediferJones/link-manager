import t from '@/lib/getTag';
import type { Vault } from '@/types';
import VaultManager from '@/lib/VaultManager';

// TO-DO
//
// Rotate salt and iv every time a folder is decrypted

const vault: Vault = window.localStorage.getItem('vault') ? JSON.parse(window.localStorage.getItem('vault')!) : { contents: {} };
const vaultMan = new VaultManager(vault)

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
            // MAKE SURE TITLE DOESNT ALREADY EXIST IN CURRENT FOLDER
            // If it does, then the previous link will be overwritten
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
        Object.keys(vault.contents).length ? vaultMan.getVaultList()
          : [ t('div', {
            textContent: 'No vault found',
            className: 'p-4 text-center text-xl font-bold text-gray-500'
          }) ]
      )
    ])
  )
});
