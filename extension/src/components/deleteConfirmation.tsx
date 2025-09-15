import { closeModal } from '@/components/modal';
import getElement from '@/lib/getElement';
import UserVault from '@/lib/userVault';
import { inline, btnClassNames } from '@/lib/buttonToggleClasses';
import { Content } from '@/types';

export default function DeleteConfirmation({ item }: { item: Content }) {
  return (
    <form className='flex flex-col gap-4'
      onSubmit={(e) => {
        e.preventDefault();
        UserVault.delete(item.title);
        closeModal();
      }}
    >
      {/* FIX ME input ring is cut off */}
      <input className='defaultBorder'
        type='text'
        placeholder='Enter title to confirm deletion'
        onInput={(e) => {
          const submitBtn = getElement<HTMLButtonElement>(
            '#deleteConfirmationSubmitBtn'
          );
          const match = e.currentTarget.value === item.title;
          submitBtn.disabled = !match;
          const { enabled, disabled } = btnClassNames;
          if (match) {
            submitBtn.classList.remove(...disabled);
            submitBtn.classList.add(...enabled);
          } else {
            submitBtn.classList.remove(...enabled);
            submitBtn.classList.add(...disabled);
          }
        }}
      />
      <button className={`bg-red-500 p-2 rounded-lg ${inline('animate')} ${inline('disabled')}`}
        id='deleteConfirmationSubmitBtn'
        disabled={true}
      >Delete</button>
    </form>
  )
}
