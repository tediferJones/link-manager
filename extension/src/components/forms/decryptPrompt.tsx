import { ErrorMsg } from '@/components/ui';
import { hideError, showError } from '@/effects';
import UserVault from '@/lib/app/userVault';
import getElement from '@/lib/utils/getElement';

// FIX ME disable hotkeys when input is focused

// FIX ME move to constants file
export const errorId = 'decryptError';
export const passwordId = 'decryptPassword';

export default function DecryptPrompt({ path }: { path: string[] }) {
  setTimeout(() => getElement<HTMLInputElement>(`#${passwordId}`).focus());
  const [ title ] = path.slice(-1);
  return (
    <form className='flex flex-col gap-4 items-center defaultBorder m-auto'
      onSubmit={async (e) => {
        e.preventDefault();
        hideError(errorId);
        const password = getElement<HTMLInputElement>(`#${passwordId}`).value;
        const decryptResult = await UserVault.decrypt(
          path,
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
      <div className='grid grid-cols-3 gap-4 w-full'>
        <label className='w-full h-full flex items-center justify-center'
          htmlFor={passwordId}
        >Password</label>
        <input className='defaultBorder col-span-2'
          // FIX ME maybe use fancy password input here
          id={passwordId}
          type='password'
          required
        />
      </div>
      <ErrorMsg id={errorId} />
      <button className='bg-fg text-bg rounded-lg p-2 w-full'
        type='submit'
      >Decrypt</button>
    </form>
  )
}
