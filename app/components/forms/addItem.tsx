import { handleAddItemInput, closeModal } from '@/app/effects';
import { newUserVault } from '@/app/lib/app/userVault';
import { addItem } from '@/app/lib/newVault/core';
import { getNewSortedKeys } from '@/app/lib/newVault/utils';
import getElement from '@/app/lib/utils/getElement';

// FIX ME consider moving these (and other exported ids) into their own file or something
// gets a little bit messy here when it comes to using the index.ts file
// maybe @/app/lib/constants/ids.ts
export const titleInputId = 'titleInput';
export const hrefInputId = 'hrefInput';
export const submitBtnId = 'addItemSubmitBtn';

export default function AddItem() {
  setTimeout(() => getElement<HTMLInputElement>(`#${titleInputId}`).focus());
  return (
    <form className='w-full grid grid-cols-3 gap-4 transition-all duration-300'
      onSubmit={(e) => {
        e.preventDefault();
        const titleInput = getElement<HTMLInputElement>(`#${titleInputId}`);
        const hrefInput = getElement<HTMLInputElement>(`#${hrefInputId}`);
        const title = titleInput.value;
        const href =  hrefInput.value;
        if (!title) return;
        // FIX ME should show an error message if add fails
        // FIX ME could use createFolder and createLink from @/app/lib/test/mockItems
        // if we do use that, move that fill to some other lib folder
        const { root, path } = newUserVault;
        if (href) {
          addItem(root, path, {
            type: 'link',
            title,
            href,
            tags: [],
            pinned: false,
            date: Date.now(),
          });
        } else {
          addItem(root, path, {
            type: 'folder',
            title,
            contents: {},
            tags: [],
            pinned: false,
            sortedKeys: getNewSortedKeys(),
            date: Date.now(),
          });
        }
        closeModal();
      }}
    >
      <label className='m-auto' htmlFor={titleInputId}>Title</label>
      <input className='defaultBorder flex-1 col-span-2'
        type='text'
        placeholder='Title'
        id={titleInputId}
        onInput={handleAddItemInput}
        required
      />
      <label className='m-auto' htmlFor={hrefInputId}>Link</label>
      <input className='defaultBorder flex-1 col-span-2'
        type='url'
        placeholder='Link'
        id={hrefInputId}
        onInput={handleAddItemInput}
      />
      {/* FIX ME consider adding a 'keep open' checkbox here */}
      {/* might useful when adding many links */}
      <button className='!cursor-not-allowed bg-primary text-bg p-2 rounded-lg opacity-50 col-span-full'
        id={submitBtnId}
        disabled={true}
      >Add</button>
    </form>
  )
}
