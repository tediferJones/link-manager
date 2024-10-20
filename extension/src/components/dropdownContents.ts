import t from '@/lib/getTag';
import { clearChildren } from '@/lib/utils';
import type VaultManager from '@/lib/VaultManager';
import type { Vault } from '@/types';

export default function dropdownContents(vaultMan: VaultManager, folder: Vault, key: string, id: string) {
  return [
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
        // This is absurd, just use a form with a submit button
        renameInput.addEventListener('blur', () => {
          console.log('trigger blur event')
          const newKey = (document.querySelector(`#rename-${id}`) as HTMLInputElement).value;
          vaultMan.renameItem(folder, key, newKey);
        });
        renameInput.focus();
      }
    }),
    !(folder.contents[key] as Vault).contents ? undefined : t('button', {
      textContent: (folder.contents[key] as Vault).locked ? 'New Pwd' : 'Lock',
      className: 'bg-orange-500 flex-1 rounded-xl',
      onclick: async () => {
        const dropdownContainer = clearChildren(`edit-${id}`)
        dropdownContainer.append(
          t('form', {
            className: 'm-0 flex gap-2 w-full',
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
                className: 'p-2 border-2 border-blue-600 rounded-xl w-full',
              }),
              t('button', {
                type: 'submit',
                textContent: 'Encrypt',
                className: 'p-2 rounded-xl bg-blue-600 text-white'
              })
            ])
        );
        (document.querySelector(`#encrypt-${id}`) as HTMLInputElement).focus();
      }
    })
  ].filter(i => i !== undefined)
}