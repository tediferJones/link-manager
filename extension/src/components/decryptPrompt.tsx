import ErrorMsg, { hideError, showError } from '@/components/errorMsg';
import getElement from '@/lib/getElement';
import UserVault from '@/lib/userVault';

// FIX ME disable hotkeys when input is focused

export default function DecryptPrompt() {
  setTimeout(() => {
    getElement<HTMLInputElement>('#directoryViewPassword').focus();
  });
  const [ title ] = UserVault.getViewDir(UserVault.path).slice(-1);
  const errorId = 'decryptError';
  return (
    <form className='flex flex-col gap-4 items-center defaultBorder w-min m-auto'
      onSubmit={async (e) => {
        e.preventDefault();
        hideError(errorId);
        const password = getElement<HTMLInputElement>(
          '#directoryViewPassword'
        ).value;
        const decryptResult = await UserVault.decrypt(
          UserVault.path,
          password
        );
        if (!decryptResult.success()) {
          showError(errorId, decryptResult.error());
        }
      }}
    >
      <div className='text-center'>
        Entering encrypted folder, please enter your password to continue
      </div>
      <span className='font-semibold'>{title}</span>
      <div className='flex gap-4 items-center'>
        <label htmlFor='directoryViewPassword'>Password</label>
        <input className='defaultBorder'
          id='directoryViewPassword'
          type='password'
          required
        />
      </div>
      <ErrorMsg id='decryptError' />
      <span className='hidden text-red-500 font-semibold'
        id={errorId}
      ></span>
      <button className='bg-fg text-bg rounded-lg p-2 w-full'
        type='submit'
      >Decrypt</button>
    </form>
  )
}
