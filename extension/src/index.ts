import t from './lib/getTag';

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

function getVaultList(folder: Vault, prefix: string[] = []) {
  return Object.keys(folder).map(key => {
    const newPrefix = prefix.concat(key);
    const idTest = newPrefix.join('-').replaceAll(' ', '_');
    let hidden = true;
    return typeof(folder[key]) === 'string' ? t('div', { className: 'flex justify-between items-center' }, [
      t('a', {
        className: 'p-2 underline text-blue-600 truncate',
        textContent: key,
        href: folder[key],
        target: '_blank',
        rel: 'noopener noreferrer'
      }),
      t('button', {
        className: 'bg-red-500 p-2 rounded-xl',
        textContent: 'Delete',
        onclick: (e) => {
          delete folder[key]
          updateRender();
        }
      })
    ]) : t('div', {}, [
        t('div', { className: 'flex justify-between items-center gap-2' }, [
          t('div', {
            textContent: `${key} (${Object.keys(folder[key]).length})`,
            className: 'flex-1 rounded-xl p-2 folder',
            onclick: (e) => {
              // On click, clear all other selected directories
              document.querySelectorAll('.folder').forEach(node => {
                node.classList.remove('bg-blue-600', 'text-white')
              })
              // document.querySelectorAll('.folderContents').forEach(node => {
              //   while (node.firstChild) node.removeChild(node.firstChild);
              // })

              folderLoc = hidden ? newPrefix : newPrefix.slice(0, newPrefix.length - 1);
              console.log(folderLoc)
              const target = e.target as HTMLDivElement
              target.classList.toggle('bg-blue-600')
              target.classList.toggle('text-white')
              // target.classList.toggle('ml-2')
              const childContainer = document.querySelector(`#${idTest}`)
              if (childContainer) {
                childContainer.classList.toggle('border-l-2')
                if (hidden) {
                  childContainer.append(...getVaultList(folder[key] as Vault, newPrefix))
                } else {
                  while (childContainer.firstChild) childContainer.removeChild(childContainer.firstChild)
                }
                hidden = !hidden
              }
            }
          }),
          t('button', {
            textContent: 'Delete',
            className: 'bg-red-500 p-2 rounded-xl',
            onclick: (e) => {
              delete folder[key];
              updateRender();
            }
          })
        ]),
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
      t('div', { className: 'flex gap-2' }, [
        t('input', {
          className: 'p-2 text-nowrap m-auto border-2 border-blue-600 rounded-xl',
          value: currentTab.title,
          id: 'title'
        }),
        t('button', {
          className: 'p-2 rounded-xl border-2 border-blue-600',
          textContent: '＋',
          onclick: (e) => {
            // MAKE SURE TITLE DOESNT ALREADY EXIST IN CURRENT FOLDER
            // If it does, then the previous link will be overwritten

            const title = (document.querySelector('#title') as HTMLInputElement).value;
            if (title && currentTab.url) {
              // const loc = folderLoc.reduce((currentLoc, key) => currentLoc = currentLoc[key] as Vault, vault)
              // loc[title] = currentTab.url;
              getCurrentFolder()[title] = currentTab.url;
            }
            updateRender();
          }
        }),
        t('button', {
          className: 'p-2 rounded-xl border-2 border-blue-600',
          textContent: '📁',
          onclick: (e) => {
            const title = (document.querySelector('#title') as HTMLInputElement).value;
            if (title) {
              // const loc = folderLoc.reduce((currentLoc, key) => currentLoc = currentLoc[key] as Vault, vault)
              // console.log(folderLoc, loc)
              // loc[title] = {}
              getCurrentFolder()[title] = {};
            }
            updateRender();
          }
        })
      ]),
      t('div', { id: 'directoryContainer', className: 'flex flex-col gap-2 py-2' }, 
        Object.keys(vault).length ? getVaultList(vault)
          : [
            t('div', {
              textContent: 'No vault found',
              className: 'p-4 text-center text-xl font-bold text-gray-500'
            })
          ]
      )

      // t('div', { id: 'directoryContainer' }, [
      //   Object.keys(vault).length ? t('div', { className: 'p-4 flex flex-col gap-2' },
      //     getVaultList(vault)
      //   ) : t('div', {
      //       textContent: 'No vault found',
      //       className: 'p-4 text-center text-xl font-bold text-gray-500'
      //     })
      // ])
    ])
  )
});

