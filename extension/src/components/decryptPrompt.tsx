import getElement from '@/lib/getElement';
import UserVault from '@/lib/userVault';

export default function DecryptPrompt() {
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
