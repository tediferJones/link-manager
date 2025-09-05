import { closeModal } from '@/components/modal';
import DeleteConfirmation from '@/components/deleteConfirmation';
import getElement from '@/lib/getElement';
import UserVault from '@/lib/userVault';
import { inline, btnClassNames } from '@/lib/buttonToggleClasses';
import { Content } from '@/types';

function handleInputChange(folder: Content<'folder'>) {
  const title = getElement<HTMLInputElement>('#folderSettingsTitle').value;
  const pwd = getElement<HTMLInputElement>('#folderSettingsPassword').value;
  const submitBtn = getElement<HTMLButtonElement>('#folderSettingsSubmitBtn');
  const disableBtn = !(title !== folder.title || pwd);
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

// FIX ME
// this should also allow renaming and deleting of folders

export default function FolderSettings({ folder }: { folder: Content<'folder'> }) {
  return (
    <div className='flex flex-col gap-4'>
      <form className='grid grid-cols-3 gap-4'
        onSubmit={async (e) => {
          e.preventDefault();
          const title = getElement<HTMLInputElement>(
            '#folderSettingsTitle'
          ).value;
          const password = getElement<HTMLInputElement>(
            '#folderSettingsPassword'
          ).value;
          if (password) await UserVault.encryptFolder(folder, password);
          if (title !== folder.title) UserVault.rename(folder.title, title);
          closeModal();
        }}
      >
        <label className='m-auto'
          htmlFor='folderSettingsTitle'
        >Name</label>
        <input className='defaultBorder col-span-2'
          id='folderSettingsTitle'
          type='text'
          disabled={!folder.title}
          value={folder.title}
          placeholder={folder.title || 'Home Directory'}
          onInput={() => handleInputChange(folder)}
        />
        <label className='m-auto' htmlFor='folderSettingsPassword'>Password</label>
        <input className='defaultBorder col-span-2'
          id='folderSettingsPassword'
          type='password'
          placeholder='Do not encrypt'
          onInput={() => handleInputChange(folder)}
        />
        <button className={`bg-fg text-bg col-span-3 rounded-lg p-2 ${inline('animate')} ${inline('disabled')}`}
          id='folderSettingsSubmitBtn'
          type='submit'
          disabled={true}
        >Save</button>
      </form>
      <hr className='col-span-3' />
      <DeleteConfirmation item={folder} />
    </div>
  )
}
