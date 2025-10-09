import { Folder, Link2 } from 'lucide';
import Icon from '@/components/icon';
import { closeModal } from '@/components/modal';
import UserVault from '@/lib/app/userVault';
import getElement from '@/lib/utils/getElement';

function handleFormInput() {
  const titleElement = getElement<HTMLInputElement>('#titleInput');
  titleElement.setCustomValidity('');
  const title = titleElement.value;
  const hrefElement = getElement<HTMLInputElement>('#hrefInput')
  hrefElement.setCustomValidity('');
  const href = hrefElement.value;
  const submitBtn = getElement<HTMLButtonElement>('#submitItemBtn');

  if (title && href) {
    submitBtn.innerHTML = '';
    submitBtn.appendChild(
      <span className='flex gap-2 justify-center'>
        <Icon name={Link2} />
        <span>Add Link</span>
      </span>
    )
    submitBtn.disabled = false;
    submitBtn.classList.remove('!cursor-not-allowed');
    submitBtn.classList.remove('opacity-50');
  } else if (title) {
    submitBtn.innerHTML = '';
    submitBtn.appendChild(
      <span className='flex gap-2 justify-center'>
        <Icon name={Folder} />
        <span>Add Folder</span>
      </span>
    )
    submitBtn.disabled = false;
    submitBtn.classList.remove('!cursor-not-allowed');
    submitBtn.classList.remove('opacity-50');
  } else {
    submitBtn.innerText = 'Add';
    submitBtn.disabled = true;
    submitBtn.classList.add('!cursor-not-allowed');
    submitBtn.classList.add('opacity-50');
  }
}

export default function AddItem() {
  setTimeout(() => getElement<HTMLInputElement>('#titleInput').focus());
  return (
    <form className='w-full grid grid-cols-3 gap-4 transition-all duration-300'
      id='newItemForm'
      onSubmit={(e) => {
        e.preventDefault();
        const titleInput = getElement<HTMLInputElement>('#titleInput');
        const hrefInput = getElement<HTMLInputElement>('#hrefInput');
        const title = titleInput.value;
        const href =  hrefInput.value;
        if (href) {
          UserVault.add(UserVault.path, {
            type: 'link',
            title,
            href,
            tags: [],
            pinned: false,
            date: Date.now(),
          });
        } else {
          UserVault.add(UserVault.path, {
            type: 'folder',
            title,
            contents: {},
            tags: [],
            pinned: false,
            sortedKeys: {
              pinned: [],
              folder: [],
              link: [],
              watched: [],
            },
            date: Date.now(),
          });
        }
        closeModal();
      }}
    >
      <label className='m-auto' htmlFor='titleInput'>Title</label>
      <input className='defaultBorder flex-1 col-span-2'
        placeholder='Title'
        id='titleInput'
        onInput={handleFormInput}
        required
      />
      <label className='m-auto' htmlFor='hrefInput'>Link</label>
      <input className='defaultBorder flex-1 col-span-2'
        placeholder='Link'
        id='hrefInput'
        onInput={handleFormInput}
      />
      {/* FIX ME consider adding a 'keep open' checkbox here */}
      {/* might useful when adding many links */}
      <button className='!cursor-not-allowed bg-primary text-bg p-2 rounded-lg opacity-50 col-span-full'
        id='submitItemBtn'
        disabled={true}
      >Add</button>
    </form>
  )
}
