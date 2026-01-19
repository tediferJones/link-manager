import { handleDeleteItemInput, closeModal } from '@/app/effects';
import { deleteItem } from '@/app/lib/newVault/core';
import { throwOnFail } from '@/app/lib/newVault/result';
import { getItemPath } from '@/app/lib/newVault/utils';
import { newUserVault } from '@/app/lib/app/userVault';
import { inline } from '@/app/lib/app/buttonToggleClasses';
import getElement from '@/app/lib/utils/getElement';
import { Content } from '@/app/types';

// FIX ME move to constants
export const submitBtnId = 'deleteItemSubmitBtn';
export const titleInputId = 'titleInputId';

// FIX ME, add better labels now that this is nested
// i.e. navigate to this component in the UI, it looks kinda ugly, fix that
export default function DeleteItem({ item }: { item: Content }) {
  return (
    <form className='flex flex-col gap-4'
      onSubmit={async (e) => {
        e.preventDefault();
        const titleInput = getElement<HTMLInputElement>(`#${titleInputId}`);
        // FIX ME maybe add an error message instead of just returning
        if (titleInput.value !== item.title) return
        const { root, path } = newUserVault;
        throwOnFail(await deleteItem(root, getItemPath(path, item)));
        closeModal();
      }}
    >
      {/* FIX ME input ring is cut off */}
      <input className='defaultBorder'
        type='text'
        placeholder='Enter title to confirm deletion'
        id={titleInputId}
        onInput={() => handleDeleteItemInput(item.title)}
        required
        // FIX ME maybe add pattern here so that we can use form validation to block submit
      />
      <button className={`bg-red-500 p-2 rounded-lg ${inline('animate')} ${inline('disabled')}`}
        id={submitBtnId}
        disabled={true}
      >Delete</button>
    </form>
  )
}
