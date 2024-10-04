import type { Record, Vault } from '@/types';
import t from '@/lib/getTag';
import { clearChildren } from '@/lib/utils';
import {
  decrypt,
  encrypt,
  getFullKey,
  getRandBase64
} from '@/lib/security';

export default function getVaultList(
  folder: Vault,
  refs: {
    updateRender: Function,
    folderLoc: string[],
  },
  prefix: string[] = [],
  id: string = 'id'
) {
  return Object.keys(folder.contents).sort().map((key, i) => {
    const idTest = id + `-${i}`
    const newPrefix = prefix.concat(key);
    let hidden = true;
    // return typeof(folder.contents[key]) === 'string' ?
    return (folder.contents[key] as Record).url ?
      t('div', {}, [
        t('div', { className: 'flex justify-between items-center' }, [
          t('a', {
            id: `title-${idTest}`,
            className: 'p-2 underline text-blue-600 truncate',
            textContent: key,
            href: folder.contents[key],
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
                    delete folder.contents[key];
                    refs.updateRender();
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
                        folder.contents[newKey] = folder.contents[key];
                        delete folder.contents[key];
                      }
                      refs.updateRender();
                    });
                    renameInput.focus();
                  }
                })
              )
            }
          })
        ]),
        t('div', { id: `edit-${idTest}`, className: 'flex gap-2 bg-gray-300 rounded-xl rounded-t-none' }),
      ]) : t('div', {}, [
        t('div', { id: `header-${idTest}`, className: 'flex justify-between items-center gap-2' }, [
          t('div', {}, [
            t('div', {
              id: `title-${idTest}`,
              textContent: `${key} (${Object.keys((folder.contents[key] as Vault).contents).length})`,
              className: 'flex-1 rounded-xl p-2 folder',
              onclick: (e) => {
                // On click, clear all other selected directories
                // document.querySelectorAll('.folder').forEach(node => {
                //   node.classList.remove('bg-blue-600', 'text-white')
                // })
                // document.querySelectorAll('.folderContents').forEach(node => {
                //   while (node.firstChild) node.removeChild(node.firstChild);
                // })

                refs.folderLoc = hidden ? newPrefix : newPrefix.slice(0, newPrefix.length - 1);
                console.log(refs.folderLoc)
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
                    dirContents.append(...getVaultList(folder.contents[key] as Vault, refs, newPrefix, idTest));
                    document.querySelector(`#header-${idTest}`)?.append(
                      // generateSettingsDropDown(target, settingsContainer, idTest, folder, key)
                      t('button', {
                        id: `settings-${idTest}`,
                        textContent: '☰',
                        className: 'w-8 h-8 flex justify-center items-center border-2 border-blue-600 p-2 rounded-xl',
                        onclick: () => {
                          settingsContainer.classList.toggle('p-2');
                          target.classList.toggle('rounded-b-none');
                          if (settingsContainer.hasChildNodes()) return clearChildren(`edit-${idTest}`)
                          settingsContainer.append(
                            t('button', {
                              textContent: 'Delete',
                              className: 'bg-red-500 flex-1 rounded-xl',
                              onclick: () => {
                                delete folder.contents[key];
                                refs.updateRender();
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
                                    folder.contents[newKey] = folder.contents[key];
                                    delete folder.contents[key];
                                  }
                                  refs.updateRender();
                                });
                                renameInput.focus();
                              }
                            }),
                            t('button', {
                              textContent: 'Lock',
                              className: 'bg-orange-500 flex-1 rounded-xl',
                              onclick: async () => {
                                const dropdownContainer = clearChildren(`edit-${idTest}`)
                                dropdownContainer.append(
                                  t('form', {
                                    className: 'm-0 flex gap-2',
                                    onsubmit: async (e) => {
                                      e.preventDefault();
                                      const form = e.currentTarget as HTMLFormElement;
                                      const password = (form.elements.namedItem('password') as HTMLInputElement).value;
                                      const salt = getRandBase64('salt');
                                      const iv = getRandBase64('iv');
                                      const encrypted = await encrypt(
                                        JSON.stringify(folder.contents[key]),
                                        await getFullKey(password, salt),
                                        iv,
                                      );
                                      console.log('encrypted', encrypted);

                                      const decrypted = await decrypt(
                                        encrypted,
                                        await getFullKey(password, salt),
                                        iv
                                      );
                                      console.log('decrypted', decrypted, JSON.parse(decrypted));
                                    }
                                  }, [
                                      t('input', {
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
                          )
                        }
                      })
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
