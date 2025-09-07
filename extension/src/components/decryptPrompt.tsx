import getElement from '@/lib/getElement';
import UserVault from '@/lib/userVault';

// FIX ME
// if currentDir is ['folder1', 'encryptedFolder', 'folder2']
// breadcrumbs will show all keys (we do not want that)
// and when trying to decrypt it will try to decrypt 'folder2'
// we need a secondary dir that will only append up until an encrypted folder is found
//
// SOLUTION
// create viewDir as a string[]
// in getCurrentDir() append each key to viewDir until we hit an encrypted folder
// convert all other uses of this.currentDir to this.viewDir
// or maybe rename currentDir to savedDir and use currentDir as viewDir

export default function DecryptPrompt() {
  setTimeout(() => {
    getElement<HTMLInputElement>('#directoryViewPassword').focus();
  });
  return (
    <form className='flex flex-col gap-2 items-center defaultBorder w-min m-auto'
      onSubmit={async (e) => {
        e.preventDefault();
        const errorContainer = getElement<HTMLSpanElement>('#decryptError');
        errorContainer.innerText = '';
        errorContainer.classList.add('hidden');
        const password = getElement<HTMLInputElement>(
          '#directoryViewPassword'
        ).value;
        try {
          await UserVault.decryptFolder(password);
        } catch {
          errorContainer.innerText = 'Incorrect Password';
          errorContainer.classList.remove('hidden');
        }
      }}
    >
      <span className='text-center'>
        This folder is encrypted, enter your password to continue
      </span>
      <div className='flex gap-2 items-center'>
        <label htmlFor='directoryViewPassword'>Password</label>
        <input className='defaultBorder'
          id='directoryViewPassword'
          type='password'
          required
        />
      </div>
      <span className='hidden text-red-500 font-semibold'
        id='decryptError'
      ></span>
      <button className='bg-fg text-bg rounded-lg p-2 w-full'
        type='submit'
      >Decrypt</button>
    </form>
  )
}
