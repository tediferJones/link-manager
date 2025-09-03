import { closeModal } from '@/components/modal';
import { getKey, getRandomBase64 } from '@/lib/encryption';
import getElement from '@/lib/getElement';
import UserVault from '@/lib/userVault';
import { Content } from '@/types';

function handleInputChange(folder: Content<'folder'>) {
  const title = getElement<HTMLInputElement>('#folderSettingsTitle').value;
  const pwd = getElement<HTMLInputElement>('#folderSettingsPassword').value;
  console.log(folder, title, pwd);

  // FIX ME
  // only enable submit button if something has changed
  // if nothing has changed it could just be an exit button?
}

// FIX ME
// this should also allow renaming and deleting of folders

export default function FolderSettings() {
  const dir = UserVault.getCurrentDir();
  if (!dir) throw Error('dir is null');
  if (dir.type !== 'folder') throw Error('dir is not a folder');

  return (
    <form className='grid grid-cols-3 gap-2'
      onSubmit={async (e) => {
        e.preventDefault();
        console.log('SUBMITTING')
        // const title = getElement('#folderSettingsTitle');
        const pwd = getElement<HTMLInputElement>(
          '#folderSettingsPassword'
        ).value;
        if (pwd) {
          // FIX ME try to use UserVault.encrypt instead of doing this manually
          const iv = getRandomBase64('iv');
          const salt = getRandomBase64('salt');
          const key = await getKey(pwd, salt);
          dir.encryption = { key, salt, iv };
        }
        closeModal();
      }}
    >
      <label className='m-auto'
        htmlFor='folderSettingsTitle'
      >Name</label>
      <input className='defaultBorder col-span-2'
        id='folderSettingsTitle'
        type='text'
        value={dir.title}
        placeholder={dir.title}
        onInput={() => handleInputChange(dir)}
      />
      <label className='m-auto' htmlFor='folderSettingsPassword'>Password</label>
      <input className='defaultBorder col-span-2'
        id='folderSettingsPassword'
        type='password'
        placeholder='Do not encrypt'
        onInput={() => handleInputChange(dir)}
      />
      <button className='bg-fg text-bg col-span-3 rounded-lg p-2'
        type='submit'
        // disabled={true}
      >Save</button>
    </form>
  )
}
