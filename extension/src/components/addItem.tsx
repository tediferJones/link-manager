import { Folder, Link2 } from 'lucide';
import Icon from '@/components/icon';
import getElement from '@/lib/getElement';
import UserVault from '@/lib/userVault';
import { closeModal } from './modal';

function handleFormInput() {
  const titleElement = getElement<HTMLInputElement>('#titleInput');
  titleElement.setCustomValidity('');
  const title = titleElement.value;
  const href = getElement<HTMLInputElement>('#hrefInput').value;
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
  return (
    <form className='w-full grid grid-cols-3 gap-4 transition-all duration-300'
      id='newItemForm'
      onSubmit={(e) => {
        e.preventDefault();
        const titleInput = getElement<HTMLInputElement>('#titleInput');
        const hrefInput = getElement<HTMLInputElement>('#hrefInput');
        const title = titleInput.value;
        const href =  hrefInput.value;
        if (!title) throw Error('missing title');
        const dir = UserVault.getCurrentDir();
        if (!dir) throw Error('dir is null');
        if (dir.type !== 'folder') throw Error('dir is encrypted')
        if (dir.contents[title]) {
          // show submit error that name already exists
          console.log('use custom validity message')
          titleInput.setCustomValidity('Name already taken');
          e.currentTarget.reportValidity();
          return;
        }
        if (href && !/^https?:\/\//.test(href)) {
          hrefInput.setCustomValidity('Links must start with http:// or https://')
          e.currentTarget.reportValidity();
          return;
        }
        if (href) {
          UserVault.addLink(title, href);
        } else {
          UserVault.addFolder(title);
        }
        titleInput.value = '';
        hrefInput.value = '';
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
