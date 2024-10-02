import t from './lib/getTag';
import { getFullKey, getRandBase64 } from './lib/security';

// TO-DO
//
// To implement password protected folders, we can add an attribute to the folder with key = '' and val = someHash
//  - If folder has '' key, ask for password before viewing
//  - However this does not really provide much actual security, it would be very easy to just view local storage and find the values that way

interface Vault {
  [key: string]: Vault | string
}

document.body.appendChild(
  t('h1', { textContent: 'LINK MANAGER', className: 'p-4 text-center text-2xl font-bold text-blue-500' })
)

function clearChildren(id: string) {
  const parent = document.querySelector(`#${id}`);
  if (!parent) throw Error(`failed to find parent container for given id: ${id}`);
  while (parent.firstChild) parent.removeChild(parent.firstChild);
  return parent;
}

function updateRender() {
  window.localStorage.setItem('vault', JSON.stringify(vault));
  const dir = clearChildren('directoryContainer');
  dir.append(...getVaultList(vault))
}

function getCurrentFolder() {
  return folderLoc.reduce((currentLoc, key) => currentLoc = currentLoc[key] as Vault, vault)
}

function generateSettingsDropDown(
  target: Element,
  container: Element,
  id: string,
  folder: Vault,
  key: string,
) {
  console.log(
    'target', target,
    'container', container,
  )
  return t('button', {
    id: `settings-${id}`,
    textContent: '☰',
    className: 'w-8 h-8 flex justify-center items-center border-2 border-blue-600 p-2 rounded-xl',
    onclick: () => {
      container.classList.toggle('p-2');
      target.classList.toggle('rounded-b-none');
      if (container.hasChildNodes()) return clearChildren(`edit-${id}`)
      container.append(
        t('button', {
          textContent: 'Delete',
          className: 'bg-red-500 flex-1 rounded-xl',
          onclick: () => {
            delete folder[key];
            updateRender();
          }
        }),
        t('button', {
          textContent: 'Rename',
          className: 'bg-green-500 flex-1 rounded-xl',
          onclick: () => {
            const title = document.querySelector(`#title-${id}`) as HTMLInputElement
            if (!title) throw Error('cant find title element')
            title.replaceWith(
              t('input', {
                id: `rename-${id}`,
                className: 'p-2 border-2 border-blue-600 rounded-xl',
                value: key,
              })
            )
            const renameInput = document.querySelector(`#rename-${id}`) as HTMLInputElement
            if (!renameInput) throw Error('cant find rename element');
            renameInput.addEventListener('blur', () => {
              console.log('trigger blur event')
              const newKey = (document.querySelector(`#rename-${id}`) as HTMLInputElement).value;
              if (newKey && newKey !== key) {
                folder[newKey] = folder[key];
                delete folder[key];
              }
              updateRender();
            });
            renameInput.focus();
          }
        }),
        t('button', {
          textContent: 'Lock',
          className: 'bg-orange-500 flex-1 rounded-xl',
          onclick: async () => {
            const key = 'this is my password'
            const bytes = new TextEncoder().encode(JSON.stringify(folder[key]));
            console.log('Buffer')
            // console.log(Buffer)
            
            // const iv = getRandBase64('iv');
            // const salt = getRandBase64('salt');
            // const encKey = getFullKey(key, salt);
            // console.log('did the thing')


            // const iv = window.crypto.getRandomValues(new Uint8Array(12));
            // console.log(
            //   'bytes', bytes,
            //   'iv', iv,
            // )
            // const encrypted = await window.crypto.subtle.encrypt(
            //   {
            //     name: "AES-GCM",
            //     iv: iv
            //   },
            //   key,
            //   encodedText
            // );
          }
        })
      )
    }
  })
}

function getVaultList(folder: Vault, prefix: string[] = [], id: string = 'id') {
  return Object.keys(folder).sort().map((key, i) => {
    const idTest = id + `-${i}`
    const newPrefix = prefix.concat(key);
    let hidden = true;
    return typeof(folder[key]) === 'string' ?
      t('div', {}, [
        t('div', { className: 'flex justify-between items-center' }, [
          t('a', {
            id: `title-${idTest}`,
            className: 'p-2 underline text-blue-600 truncate',
            textContent: key,
            href: folder[key],
            target: '_blank',
            rel: 'noopener noreferrer'
          }),
          t('button', {
            id: `settings-${idTest}`,
            textContent: '☰',
            className: 'w-8 h-8 flex justify-center items-center border-2 border-blue-600 p-2 rounded-xl',
            onclick: () => {
              const container = document.querySelector(`#edit-${idTest}`)
              if (!container) throw Error('cant find edit container')
              container.classList.toggle('p-2');
              // target.classList.toggle('rounded-b-none');
              document.querySelector(`#title-${idTest}`)?.classList.toggle('rounded-b-none');
              if (container.hasChildNodes()) return clearChildren(`edit-${idTest}`)
              container.append(
                t('button', {
                  textContent: 'Delete',
                  className: 'bg-red-500 flex-1 rounded-xl',
                  onclick: () => {
                    delete folder[key];
                    updateRender();
                  }
                }),
                t('button', {
                  textContent: 'Rename',
                  className: 'bg-green-500 flex-1 rounded-xl',
                  onclick: () => {
                    const title = document.querySelector(`#title-${idTest}`) as HTMLInputElement
                    if (!title) throw Error('cant find title element')
                    title.replaceWith(
                      t('input', {
                        id: `rename-${idTest}`,
                        className: 'p-2 border-2 border-blue-600 rounded-xl',
                        value: key,
                      })
                    )
                    const renameInput = document.querySelector(`#rename-${idTest}`) as HTMLInputElement
                    if (!renameInput) throw Error('cant find rename element');
                    renameInput.addEventListener('blur', () => {
                      console.log('trigger blur event')
                      const newKey = (document.querySelector(`#rename-${idTest}`) as HTMLInputElement).value;
                      if (newKey && newKey !== key) {
                        folder[newKey] = folder[key];
                        delete folder[key];
                      }
                      updateRender();
                    });
                    renameInput.focus();
                  }
                })
              )
            }
          })
        ]),
        t('div', { id: `edit-${idTest}`, className: 'flex gap-2 bg-gray-300 rounded-xl rounded-t-none' }),
      ])
      : t('div', {}, [
        t('div', { id: `header-${idTest}`, className: 'flex justify-between items-center gap-2' }, [
          t('div', {}, [
            t('div', {
              id: `title-${idTest}`,
              textContent: `${key} (${Object.keys(folder[key]).length})`,
              className: 'flex-1 rounded-xl p-2 folder',
              onclick: (e) => {
                // On click, clear all other selected directories
                // document.querySelectorAll('.folder').forEach(node => {
                //   node.classList.remove('bg-blue-600', 'text-white')
                // })
                // document.querySelectorAll('.folderContents').forEach(node => {
                //   while (node.firstChild) node.removeChild(node.firstChild);
                // })

                folderLoc = hidden ? newPrefix : newPrefix.slice(0, newPrefix.length - 1);
                console.log(folderLoc)
                const target = e.target as HTMLDivElement;
                target.classList.toggle('bg-blue-600');
                target.classList.toggle('text-white');
                // target.classList.toggle('ml-2')
                const dirContents = document.querySelector(`#${idTest}`);
                const settingsContainer = document.querySelector(`#edit-${idTest}`)
                if (!settingsContainer) throw Error('Cant find edit container')
                if (dirContents) {
                  dirContents.classList.toggle('border-l-2');
                  if (hidden) {
                    // dirContents.append(...getVaultList(folder[key] as Vault, newPrefix));
                    dirContents.append(...getVaultList(folder[key] as Vault, newPrefix, idTest));
                    document.querySelector(`#header-${idTest}`)?.append(
                      generateSettingsDropDown(target, settingsContainer, idTest, folder, key)
                    )
                  } else {
                    while (dirContents.firstChild) dirContents.removeChild(dirContents.firstChild);
                    document.querySelector(`#settings-${idTest}`)?.remove()
                  }
                  hidden = !hidden;
                }
              }
            })
          ]),

        ]),
        t('div', { id: `edit-${idTest}`, className: 'flex gap-2 bg-gray-300 rounded-xl rounded-tl-none' }),
        t('div', { id: idTest, className: 'm-2 mr-0 border-blue-600 folderContents' })
      ])
  })
}

const vault: Vault = window.localStorage.getItem('vault') ? JSON.parse(window.localStorage.getItem('vault')!) : {};
let folderLoc: string[] = [];

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

            const title = (document.querySelector('#title') as HTMLInputElement).value;
            if (title && currentTab.url) getCurrentFolder()[title] = currentTab.url;
            updateRender();
          }
        }),
        t('button', {
          className: 'p-2 rounded-xl border-2 border-blue-600',
          textContent: '📁',
          type: 'submit',
          onclick: (e) => {
            const title = (document.querySelector('#title') as HTMLInputElement).value;
            if (title) getCurrentFolder()[title] = {};
            updateRender();
          }
        })
      ]),
      t('div', { id: 'directoryContainer', className: 'flex flex-col gap-2 py-2' }, 
        Object.keys(vault).length ? getVaultList(vault)
          : [ t('div', {
            textContent: 'No vault found',
            className: 'p-4 text-center text-xl font-bold text-gray-500'
          }) ]
      )
    ])
  )
});

