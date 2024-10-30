import t from '@/lib/getTag';
import dropdownContents from '@/components/dropdownContents';
import { clearChildren, isFolder } from '@/lib/utils';
import type VaultManager from '@/lib/VaultManager';
import type { Vault } from '@/types';

// export default function renderLink({ id, folder, key }: Props, vaultMan: VaultManager) {
export default function renderLink(id: string, folder: Vault, key: string, vaultMan: VaultManager) {
  const item = folder.contents[key]
  if (isFolder(item)) throw Error('this is a folder not a link')
  return t('div', { className: `rounded-xl ${item.queuePos === folder.queueStart ? 'bg-blue-300' : item.queuePos < folder.queueStart ? 'bg-gray-200' : ''}` }, [
    t('div', { className: 'flex justify-between items-center' }, [
      t('a', {
        id: `title-${id}`,
        className: 'p-2 underline text-blue-600 truncate',
        textContent: `${item.queuePos + 1}.) ${key}`,
        href: item.url,
        target: '_blank',
        rel: 'noopener noreferrer'
      }),
      t('p', { textContent: `View count: ${item.viewCount}` }),
      t('button', {
        id: `settings-${id}`,
        textContent: '☰',
        className: 'w-8 h-8 flex justify-center items-center border-2 border-blue-600 p-2 rounded-xl',
        onclick: () => {
          const container = document.querySelector(`#edit-${id}`)
          if (!container) throw Error('cant find edit container')
          container.classList.toggle('p-2');
          document.querySelector(`#title-${id}`)?.classList.toggle('rounded-b-none');
          if (container.hasChildNodes()) return clearChildren(`edit-${id}`)
          container.append(...dropdownContents(vaultMan, folder, key, id))
        }
      })
    ]),
    t('div', { id: `edit-${id}`, className: 'flex gap-2 bg-gray-300 rounded-xl rounded-t-none' }),
  ])
}
