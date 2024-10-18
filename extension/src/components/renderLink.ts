import t from '@/lib/getTag';
import { clearChildren } from '@/lib/utils';
import type VaultManager from '@/lib/VaultManager';
import { isFolder, type Props, type Record, type Vault } from '@/types';

// export default function renderLink({ id, folder, key }: Props, vaultMan: VaultManager) {
export default function renderLink(id: string, folder: Vault, key: string, vaultMan: VaultManager) {
  const item = folder.contents[key]
  if (isFolder(item)) throw Error('this is a folder not a link')
  return t('div', {}, [
    t('div', { className: 'flex justify-between items-center' }, [
      t('a', {
        id: `title-${id}`,
        className: 'p-2 underline text-blue-600 truncate',
        textContent: key,
        href: item.url,
        // href: folder.contents[key].url + `&t=${folder.contents[key].currentTime || 0}s`,
        target: '_blank',
        rel: 'noopener noreferrer'
      }),
      t('p', { textContent: `View count: ${item.viewCount}` }),
      // t('button', {
      //   className: 'bg-red-500',
      //   textContent: 'log stats',
      //   onclick: () => console.log(folder.contents[key])
      // }),
      t('button', {
        id: `settings-${id}`,
        textContent: '☰',
        className: 'w-8 h-8 flex justify-center items-center border-2 border-blue-600 p-2 rounded-xl',
        onclick: () => {
          const container = document.querySelector(`#edit-${id}`)
          if (!container) throw Error('cant find edit container')
          container.classList.toggle('p-2');
          // target.classList.toggle('rounded-b-none');
          document.querySelector(`#title-${id}`)?.classList.toggle('rounded-b-none');
          if (container.hasChildNodes()) return clearChildren(`edit-${id}`)
          container.append(
            t('button', {
              textContent: 'Delete',
              className: 'bg-red-500 flex-1 rounded-xl',
              onclick: () => {
                vaultMan.deleteItem(folder, key)
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
                  vaultMan.saveAndRender();
                });
                renameInput.focus();
              }
            })
          )
        }
      })
    ]),
    t('div', { id: `edit-${id}`, className: 'flex gap-2 bg-gray-300 rounded-xl rounded-t-none' }),
  ])
}
