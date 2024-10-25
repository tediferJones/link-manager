import t from '@/lib/getTag';
import type { Vault } from '@/types';
import type VaultManager from '@/lib/VaultManager';
import { clearChildren, isFolder } from '@/lib/utils';
import dropdownContents from '@/components/dropdownContents';

export default function renderFolder(id: string, folder: Vault, key: string, vaultMan: VaultManager) {
  const item = folder.contents[key]
  if (!isFolder(item)) throw Error('this is not a folder')
  let hidden = false;
  return t('div', {}, [
    t('div', { id: `header-${id}`, className: 'flex justify-between items-center gap-2 rounded-t-xl transition-all duration-1000' }, [
      t('div', {
        id: `title-${id}`,
        textContent: `${key} (${Object.keys((folder.contents[key] as Vault).contents).length})`,
        className: 'flex-1 rounded-xl p-2 folder hover:bg-blue-600 hover:text-white transition-all',
        onclick: () => {
          // vaultMan.currentLocation = item
          vaultMan.setCurrentFolder(item)
          vaultMan.render()
         }
      }),
      item.locked ? t('p', { textContent: '🔓' }) : undefined,
      t('button', {
        id: `settings-${id}`,
        textContent: '☰',
        className: 'w-8 h-8 flex justify-center items-center border-2 border-blue-600 p-2 rounded-xl',
        onclick: () => {
          document.querySelector(`#header-${id}`)!.classList.toggle('bg-blue-600')
          document.querySelector(`#title-${id}`)!.classList.toggle('text-white')
          document.querySelector(`#settings-${id}`)!.classList.toggle('text-white')
          const settingsContainer = clearChildren(`edit-${id}`)
          settingsContainer.classList.toggle('p-2')
          hidden = !hidden
          if (!hidden) return 
          settingsContainer.append(...dropdownContents(vaultMan, folder, key, id));
        }
      })
    ]),
    t('div', { id: `edit-${id}`, className: 'flex gap-2 bg-gray-300 rounded-b-xl' }),
  ])
}
