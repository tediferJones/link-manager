import t from '@/lib/getTag';
import { clearChildren } from '@/lib/utils';
import getVaultList from '@/components/getVaultList';
import type { Vault } from '@/types';

// TO-DO
//
// To implement password protected folders, we can add an attribute to the folder with key = '' and val = someHash
//  - If folder has '' key, ask for password before viewing
//  - However this does not really provide much actual security, it would be very easy to just view local storage and find the values that way

// const vault: Vault = window.localStorage.getItem('vault') ? JSON.parse(window.localStorage.getItem('vault')!) : { contents: {} };
const vault: Vault = window.localStorage.getItem('vault') ? JSON.parse(window.localStorage.getItem('vault')!) : { contents: {} };

// Why? Because stuffing these values in an object is the closest thing we have to using references in javascript
const refs: {
  folderLoc: string[],
  updateRender: Function
} = {
    folderLoc: [],
    updateRender: () => {
      window.localStorage.setItem('vault', JSON.stringify(vault));
      const dir = clearChildren('directoryContainer');
      dir.append(...getVaultList(vault, refs))
    }
  }

document.body.appendChild(
  t('h1', { textContent: 'LINK MANAGER', className: 'p-4 text-center text-2xl font-bold text-blue-500' })
)

function getCurrentFolder() {
  return refs.folderLoc.reduce((currentLoc, key) => currentLoc = currentLoc.contents[key] as Vault, vault)
}

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
          // className: 'p-2 text-nowrap m-auto border-2 border-blue-600 rounded-xl',
          className: 'p-2 border-2 border-blue-600 rounded-xl',
          value: currentTab.title,
          required: true,
          id: 'title'
        }),
        t('button', {
          className: 'p-2 rounded-xl border-2 border-blue-600',
          textContent: '＋',
          type: 'submit',
          onclick: (e) => {
            // MAKE SURE TITLE DOESNT ALREADY EXIST IN CURRENT FOLDER
            // If it does, then the previous link will be overwritten

            console.log('CLICKED THE FUCKIN ADD BUTTON')
            const title = (document.querySelector('#title') as HTMLInputElement).value;
            // console.log(getCurrentFolder())
            if (title && currentTab.url) getCurrentFolder().contents[title] = { url: currentTab.url, viewed: false };
            refs.updateRender();
          }
        }),
        t('button', {
          className: 'p-2 rounded-xl border-2 border-blue-600',
          textContent: '📁',
          type: 'submit',
          onclick: (e) => {
            const title = (document.querySelector('#title') as HTMLInputElement).value;
            if (title) getCurrentFolder().contents[title] = { contents: {} };
            refs.updateRender();
          }
        })
      ]),
      t('div', { id: 'directoryContainer', className: 'flex flex-col gap-2 py-2' }, 
        // Object.keys(vault).length ? getVaultList(vault, refs)
        Object.keys(vault.contents).length ? getVaultList(vault, refs)
          : [ t('div', {
            textContent: 'No vault found',
            className: 'p-4 text-center text-xl font-bold text-gray-500'
          }) ]
      )
    ])
  )
});
