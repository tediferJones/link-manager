import t from '@/lib/getTag';
import { clearChildren } from '@/lib/utils';
import type VaultManager from '@/lib/VaultManager';
import type { Props, Vault } from '@/types';

export default function renderLockedFolder(id: string, folder: Vault, key: string, vaultMan: VaultManager) {
  return t('div', {}, [
    t('div', { id: `header-${id}`, className: 'flex justify-between items-center gap-2 rounded-t-xl' }, [
    // t('div', { id: `header-${id}`, className: 'flex justify-between items-center gap-2 rounded-t-xl hover:bg-orange-600 hover:text-white transition-all' }, [
      t('div', {
        id: `title-${id}`,
        textContent: `${key}`,
        className: 'flex-1 rounded-xl p-2 folder',
      }),
      t('button', {
        textContent: '🔒',
        className: 'border-2 border-orange-600 rounded-xl p-2 w-8 h-8 flex justify-center items-center',
        onclick: () => {
          document.querySelector(`#header-${id}`)?.classList.toggle('bg-gray-300')
          const dropdown = document.querySelector(`#edit-${id}`)
          dropdown?.classList.toggle('p-2')
          if (!dropdown || dropdown.firstChild) return clearChildren(`edit-${id}`)
          // const dropdown = clearChildren(`edit-${id}`)
          console.log(dropdown)
          console.log('rendering')
          dropdown.append(
            t('form', {
              className: 'w-full m-0 flex gap-2',
              onsubmit: async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const password = (form.elements.namedItem(`decrypt-${id}`) as HTMLInputElement).value;
                vaultMan.decryptFolder(folder.contents[key] as Vault, password)
                // vaultMan.parentLocation = folder
              }
            }, [
                t('input', {
                  id: `decrypt-${id}`,
                  type: 'text',
                  placeholder: 'Password',
                  required: true,
                  className: 'p-2 rounded-xl'
                }),
                t('button', {
                  textContent: 'Decrypt',
                  type: 'submit',
                  className: 'p-2 rounded-xl bg-orange-600'
                })
              ])
          );
          (document.querySelector(`#decrypt-${id}`) as HTMLInputElement).focus()
        }
      })
    ]),
    t('div', { id: `edit-${id}`, className: 'flex gap-2 bg-gray-300 rounded-xl rounded-t-none' }),
  ])
}
