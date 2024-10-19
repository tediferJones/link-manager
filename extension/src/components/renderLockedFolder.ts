import t from '@/lib/getTag';
import { clearChildren } from '@/lib/utils';
import type VaultManager from '@/lib/VaultManager';
import type { Props, Vault } from '@/types';

export default function renderLockedFolder(id: string, folder: Vault, key: string, vaultMan: VaultManager) {
  return t('div', {}, [
    t('div', {
      id: `header-${id}`,
      className: 'flex justify-between items-center gap-2 rounded-xl hover:bg-orange-600 hover:text-white transition-all',
      onclick: () => {
        document.querySelector(`#header-${id}`)?.classList.toggle('bg-orange-600')
        document.querySelector(`#header-${id}`)?.classList.toggle('rounded-b-none')
        const dropdown = document.querySelector(`#edit-${id}`)
        dropdown?.classList.toggle('p-2')
        if (!dropdown || dropdown.firstChild) return clearChildren(`edit-${id}`)
        dropdown.append(
          t('form', {
            className: 'w-full m-0 flex gap-2',
            onsubmit: async (e) => {
              e.preventDefault();
              const errorContainer = document.querySelector(`#error-${id}`);
              if (!errorContainer) throw Error('Cant find error container');
              errorContainer.textContent = '';
              errorContainer.classList.remove('p-2')
              const form = e.currentTarget as HTMLFormElement;
              const password = (form.elements.namedItem(`decrypt-${id}`) as HTMLInputElement).value;
              const error = await vaultMan.decryptFolder(folder.contents[key] as Vault, password);
              console.log(error)
              if (error) {
                errorContainer.textContent = error;
                errorContainer.classList.add('p-2')
              }
            }
          }, [
              t('input', {
                id: `decrypt-${id}`,
                type: 'password',
                placeholder: 'Password',
                required: true,
                className: 'p-2 rounded-xl w-full'
              }),
              t('button', {
                textContent: 'Decrypt',
                type: 'submit',
                className: 'p-2 rounded-xl bg-orange-600 hover:text-white transition-all'
              })
            ]),
          t('p', { id: `error-${id}`, className: 'text-center text-red-500 pb-0 font-bold text-lg' })
        );
        (document.querySelector(`#decrypt-${id}`) as HTMLInputElement).focus()
      }
    }, [
        t('div', {
          id: `title-${id}`,
          textContent: `${key}`,
          className: 'flex-1 rounded-xl p-2 folder',
        }),
        t('button', {
          textContent: '🔒',
          className: 'border-2 border-orange-600 rounded-xl p-2 w-8 h-8 flex justify-center items-center',

        })
      ]),
    t('div', { id: `edit-${id}`, className: 'bg-gray-300 rounded-b-xl' }),
  ])
}
