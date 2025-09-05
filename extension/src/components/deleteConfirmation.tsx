import { closeModal } from '@/components/modal';
import getElement from '@/lib/getElement';
import UserVault from '@/lib/userVault';
import { inline, btnClassNames } from '@/lib/buttonToggleClasses';
import { AnyContent } from '@/types';

export default function DeleteConfirmation({ item }: { item: AnyContent }) {
  return (
    <form className='flex flex-col gap-4'
      onSubmit={() => {
        UserVault.delete(item.title);
        closeModal();
      }}
    >
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
        type='button'
        disabled={true}
      >Delete</button>
    </form>
  )
}
