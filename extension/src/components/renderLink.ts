import t from '@/lib/getTag';
import { clearChildren } from '@/lib/utils';
import type VaultManager from '@/lib/VaultManager';
import type { Props } from '@/types';

export default function renderLink({ idTest, folder, key }: Props, vaultMan: VaultManager) {
  console.log('rendering link', folder.contents[key].url)
  return t('div', {}, [
    t('div', { className: 'flex justify-between items-center' }, [
      t('a', {
        id: `title-${idTest}`,
        className: 'p-2 underline text-blue-600 truncate',
        textContent: key,
        href: folder.contents[key].url,
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
                vaultMan.deleteItem(folder, key)
                // delete folder.contents[key];
                // refs.updateRender();
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
                  vaultMan.save();
                  vaultMan.render();
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
}
