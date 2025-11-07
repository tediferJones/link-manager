import { ErrorMsg } from '@/components/ui';
import { hideError, showError, closeModal } from '@/effects';
import { newUserVault } from '@/lib/app/userVault';
import { btnClassNames, inline } from '@/lib/app/buttonToggleClasses';
import getElement from '@/lib/utils/getElement';
import { Content } from '@/types';
import { renameItem } from '@/lib/newVault/core';
import { getItemPath } from '@/lib/newVault/utils';
import { throwOnFail } from '@/lib/newVault/result';
import { enableEncryption } from '@/lib/newVault/encryption';

// FIX ME move to constants file
export const renameErrorId = 'itemSettingsRenameError';
export const titleId = 'itemSettingsTitle';
export const passwordId = 'itemSettingsPassword';
export const submitBtnId = 'itemSettingsSubmitBtn';

export default function EditItem({ item }: { item: Content<'link' | 'watched' | 'folder'> }) {
  // FIX ME maybe extra to its own effect?
  //  - Provide a function that returns true or false and the button's id
  //  - automagically set button's disabled state by running function
  //  - then reuse that effect in other components with similar buttons
  //    - Which will mostly be inside forms
  function handleInputChange(item: Content) {
    const checkForChange: ((item: Content) => boolean)[] = [
      (item) => title === item.title,
      () => !pwd,
    ];

    const title = getElement<HTMLInputElement>(`#${titleId}`).value;
    const pwd = document.querySelector<HTMLInputElement>(
      `#${passwordId}`
    )?.value;
    const submitBtn = getElement<HTMLButtonElement>(`#${submitBtnId}`);
    const disableBtn = checkForChange.every(check => check(item));
    submitBtn.disabled = disableBtn;
    const { enabled, disabled } = btnClassNames;
    if (disableBtn) {
      submitBtn.classList.remove(...enabled);
      submitBtn.classList.add(...disabled);
    } else {
      submitBtn.classList.remove(...disabled);
      submitBtn.classList.add(...enabled);
    }
  }

  // FIX ME maybe add some indicator to title input that will indicate if current value is already taken or not

  return (
    <form className='grid grid-cols-3 gap-4'
      onSubmit={async (e) => {
        e.preventDefault();
        hideError(renameErrorId);
        const title = getElement<HTMLInputElement>(`#${titleId}`).value;
        // FIX ME wrap in try catch or something to not sure document.querySelector
        const password = document.querySelector<HTMLInputElement>(`#${passwordId}`)?.value;
        const { root, path } = newUserVault;
        if (item.type === 'folder' && password) {
          throwOnFail(
            await enableEncryption(root, getItemPath(path, item), password)
          );
        }
        if (title !== item.title) {
          const { root, path } = newUserVault;
          const renameResult = await renameItem(
            root,
            getItemPath(path, item),
            title
          );
          if (!renameResult.success) {
            showError(renameErrorId, renameResult.error);
          }
        }
        closeModal();
      }}
    >
      <label className='m-auto' htmlFor={titleId}>Name</label>
      <input className='defaultBorder col-span-2'
        id={titleId}
        type='text'
        value={item.title}
        placeholder={item.title}
        onInput={() => handleInputChange(item)}
      />
      <ErrorMsg id={renameErrorId} />
      {item.type === 'folder' && (
        <>
          <label className='m-auto'
            htmlFor={passwordId}
          >Password</label>
          <input className='defaultBorder col-span-2'
            // FIX ME try to add a little eye icon to toggle password visible/hidden
            id={passwordId}
            type='password'
            placeholder='Do not encrypt'
            onInput={() => handleInputChange(item)}
          />
        </>
      )}
      {/* FIX ME use fancy button here */}
      <button className={`bg-fg text-bg col-span-3 rounded-lg p-2 ${inline('animate')} ${inline('disabled')}`}
        id={submitBtnId}
        type='submit'
        disabled={true}
      >Save</button>
    </form>
  )
}
