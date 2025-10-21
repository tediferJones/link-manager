import { handleDeleteItemInput, closeModal } from '@/effects';
import UserVault from '@/lib/app/userVault';
import { inline } from '@/lib/app/buttonToggleClasses';
import getElement from '@/lib/utils/getElement';
import { Content } from '@/types';

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
        (await UserVault.delete(UserVault.getItemPath(item))).throw();
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
