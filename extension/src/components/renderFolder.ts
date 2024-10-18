import t from '@/lib/getTag';
import { isFolder, type Props, type Vault } from '@/types';
import type VaultManager from '@/lib/VaultManager';
import { clearChildren } from '@/lib/utils';

// export default function renderFolder({ id, folder, key, newPrefix, hidden }: Props, vaultMan: VaultManager) {
export default function renderFolder(id: string, folder: Vault, key: string, vaultMan: VaultManager) {
  const item = folder.contents[key]
  if (!isFolder(item)) throw Error('this is not a folder')
  let hidden = false;
  return t('div', {}, [
    t('div', { id: `header-${id}`, className: 'flex justify-between items-center gap-2' }, [
      t('div', {
        id: `title-${id}`,
        textContent: `${key} (${Object.keys((folder.contents[key] as Vault).contents).length})`,
        className: 'flex-1 rounded-xl p-2 folder hover:bg-blue-600 hover:text-white transition-all',
        onclick: (e) => {
          vaultMan.currentLocation = item
          // document.querySelector(`#folderTitle`)!.textContent = key
          // vaultMan.parentLocation = folder
          vaultMan.render()
          // const dirContainer = clearChildren('directoryContainer')
          // dirContainer.append(vaultMan.render())
          // const dirContainer = document.querySelector('#directoryContainer')
          // if (!dirContainer) throw Error('cant find directory container')

          // OLD VERSION
          // // On click, clear all other selected directories
          // // document.querySelectorAll('.folder').forEach(node => {
          // //   node.classList.remove('bg-blue-600', 'text-white')
          // // })
          // // document.querySelectorAll('.folderContents').forEach(node => {
          // //   while (node.firstChild) node.removeChild(node.firstChild);
          // // })

          // // vaultMan.folder = hidden ? newPrefix : newPrefix.slice(0, newPrefix.length - 1);
          // const target = e.target as HTMLDivElement;
          // target.classList.toggle('bg-blue-600');
          // target.classList.toggle('text-white');
          // // target.classList.toggle('ml-2')
          // const dirContents = document.querySelector(`#${id}`);
          // const settingsContainer = document.querySelector(`#edit-${id}`)
          // if (!settingsContainer) throw Error('Cant find edit container')
          // if (dirContents) {
          //   dirContents.classList.toggle('border-l-2');
          //   if (hidden) {
          //     // dirContents.append(...getVaultList(folder[key] as Vault, newPrefix));
          //     // dirContents.append(...vaultMan.getVaultList(folder.contents[key] as Vault, newPrefix, id));
          //     document.querySelector(`#header-${id}`)?.append(
          //       // generateSettingsDropDown(target, settingsContainer, id, folder, key)
          //       t('button', {
          //         id: `settings-${id}`,
          //         textContent: '☰',
          //         className: 'w-8 h-8 flex justify-center items-center border-2 border-blue-600 p-2 rounded-xl',
          //         onclick: () => {
          //           settingsContainer.classList.toggle('p-2');
          //           target.classList.toggle('rounded-b-none');
          //           if (settingsContainer.hasChildNodes()) return clearChildren(`edit-${id}`)
          //           settingsContainer.append(
          //             t('button', {
          //               textContent: 'Delete',
          //               className: 'bg-red-500 flex-1 rounded-xl',
          //               onclick: () => {
          //                 vaultMan.deleteItem(folder, key);
          //               }
          //             }),
          //             t('button', {
          //               textContent: 'Rename',
          //               className: 'bg-green-500 flex-1 rounded-xl',
          //               onclick: () => {
          //                 const title = document.querySelector(`#title-${id}`) as HTMLInputElement
          //                 if (!title) throw Error('cant find title element')
          //                 title.replaceWith(
          //                   t('input', {
          //                     id: `rename-${id}`,
          //                     className: 'p-2 border-2 border-blue-600 rounded-xl',
          //                     value: key,
          //                   })
          //                 )
          //                 const renameInput = document.querySelector(`#rename-${id}`) as HTMLInputElement
          //                 if (!renameInput) throw Error('cant find rename element');
          //                 renameInput.addEventListener('blur', () => {
          //                   console.log('trigger blur event')
          //                   const newKey = (document.querySelector(`#rename-${id}`) as HTMLInputElement).value;
          //                   if (newKey && newKey !== key) {
          //                     folder.contents[newKey] = folder.contents[key];
          //                     delete folder.contents[key];
          //                   }
          //                   // vaultMan.save()
          //                   // vaultMan.render()
          //                   vaultMan.saveAndRender();
          //                 });
          //                 renameInput.focus();
          //               }
          //             }),
          //             t('button', {
          //               textContent: 'Lock',
          //               className: 'bg-orange-500 flex-1 rounded-xl',
          //               onclick: async () => {
          //                 const dropdownContainer = clearChildren(`edit-${id}`)
          //                 dropdownContainer.append(
          //                   t('form', {
          //                     className: 'm-0 flex gap-2',
          //                     onsubmit: async (e) => {
          //                       e.preventDefault();
          //                       const form = e.currentTarget as HTMLFormElement;
          //                       const password = (form.elements.namedItem('password') as HTMLInputElement).value;
          //                       vaultMan.encryptFolder(folder.contents[key] as Vault, password)
          //                     }
          //                   }, [
          //                       t('input', {
          //                         id: `encrypt-${id}`,
          //                         name: 'password',
          //                         type: 'password',
          //                         required: true,
          //                         placeholder: 'Password',
          //                         className: 'p-2 border-2 border-blue-600 rounded-xl',
          //                       }),
          //                       t('button', {
          //                         type: 'submit',
          //                         textContent: 'Encrypt',
          //                         className: 'p-2 rounded-xl bg-blue-600 text-white'
          //                       })
          //                     ])
          //                 )
          //               }
          //             })
          //           );
          //           // console.log(`encrypt-${id}`);
          //           // Why does this only work with a timeout of 2 seconds?
          //           setTimeout(() => {
          //             (document.querySelector(`#encrypt-${id}`) as HTMLInputElement).focus();
          //           }, 2000)
          //         }
          //       })
          //     )
          //   } else {
          //     while (dirContents.firstChild) dirContents.removeChild(dirContents.firstChild);
          //     document.querySelector(`#settings-${id}`)?.remove()
          //   }
          //   hidden = !hidden;
          // }
        }
      }),
      t('button', {
        id: `settings-${id}`,
        textContent: '☰',
        className: 'w-8 h-8 flex justify-center items-center border-2 border-blue-600 p-2 rounded-xl',
        onclick: () => {
          // settingsContainer.classList.toggle('p-2');
          // target.classList.toggle('rounded-b-none');
          // if (settingsContainer.hasChildNodes()) return clearChildren(`edit-${id}`)
          console.log(hidden)
          const settingsContainer = clearChildren(`edit-${id}`)
          settingsContainer.classList.toggle('p-2')
          hidden = !hidden
          if (!hidden) return 
          settingsContainer.append(
            t('button', {
              textContent: 'Delete',
              className: 'bg-red-500 flex-1 rounded-xl',
              onclick: () => {
                vaultMan.deleteItem(folder, key);
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
                    folder.contents[newKey] = folder.contents[key];
                    delete folder.contents[key];
                  }
                  // vaultMan.save()
                  // vaultMan.render()
                  vaultMan.saveAndRender();
                });
                renameInput.focus();
              }
            }),
            t('button', {
              textContent: 'Lock',
              className: 'bg-orange-500 flex-1 rounded-xl',
              onclick: async () => {
                const dropdownContainer = clearChildren(`edit-${id}`)
                dropdownContainer.append(
                  t('form', {
                    className: 'm-0 flex gap-2',
                    onsubmit: async (e) => {
                      e.preventDefault();
                      const form = e.currentTarget as HTMLFormElement;
                      const password = (form.elements.namedItem('password') as HTMLInputElement).value;
                      vaultMan.encryptFolder(folder.contents[key] as Vault, password)
                    }
                  }, [
                      t('input', {
                        id: `encrypt-${id}`,
                        name: 'password',
                        type: 'password',
                        required: true,
                        placeholder: 'Password',
                        className: 'p-2 border-2 border-blue-600 rounded-xl',
                      }),
                      t('button', {
                        type: 'submit',
                        textContent: 'Encrypt',
                        className: 'p-2 rounded-xl bg-blue-600 text-white'
                      })
                    ])
                )
              }
            })
          );
          // console.log(`encrypt-${id}`);
          // Why does this only work with a timeout of 2 seconds?
          setTimeout(() => {
            (document.querySelector(`#encrypt-${id}`) as HTMLInputElement).focus();
          }, 2000)
        }
      })
    ]),
    t('div', { id: `edit-${id}`, className: 'flex gap-2 bg-gray-300 rounded-xl rounded-tl-none' }),
    t('div', { id: id, className: 'm-2 mr-0 border-blue-600 folderContents' })
  ])
}
