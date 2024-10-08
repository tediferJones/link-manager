import t from '@/lib/getTag';
import { clearChildren } from '@/lib/utils';
import { decrypt, getFullKey } from '@/lib/security';
import type { Props, Vault } from '@/types';


export default function renderLockedFolder({ idTest, folder, key, refs }: Props) {
  // return t('p', { textContent: 'This is a locked folder' })
  return t('div', {}, [
    t('div', { id: `header-${idTest}`, className: 'flex justify-between items-center gap-2' }, [
      t('div', {
        id: `title-${idTest}`,
        textContent: `${key}`,
        className: 'flex-1 rounded-xl p-2 folder',
      }),
      t('button', {
        textContent: '🔒',
        className: 'border-2 border-orange-600 rounded-xl p-2',
        onclick: () => {
          const dropdown = clearChildren(`edit-${idTest}`)
          dropdown.classList.toggle('p-2')
          dropdown.append(
            t('form', {
              className: 'w-full m-0 flex gap-2',
              onsubmit: async (e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const password = (form.elements.namedItem(`decrypt-${idTest}`) as HTMLInputElement).value;
                // console.log('Decrypt password', password, folder.contents[key].locked)
                const { data, iv, salt } = (folder.contents[key] as Vault).locked!
                const fullKey = await getFullKey(password, salt)
                // We need to catch if decrypt throws an error, this means the password was incorrect
                const decrypted = await decrypt( data, fullKey, iv)
                console.log('decrypted data', JSON.parse(decrypted));

                (folder.contents[key] as Vault).contents = JSON.parse(decrypted).contents;
                (folder.contents[key] as Vault).locked!.fullKey = fullKey
                refs.updateRender()
              }
            }, [
                t('input', {
                  id: `decrypt-${idTest}`,
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
          (document.querySelector(`#decrypt-${idTest}`) as HTMLInputElement).focus()
        }
      })
    ]),
    t('div', { id: `edit-${idTest}`, className: 'flex gap-2 bg-gray-300 rounded-xl rounded-t-none' }),
  ])
}
