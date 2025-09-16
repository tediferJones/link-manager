import { closeModal } from '@/components/modal';
import DeleteConfirmation from '@/components/deleteConfirmation';
import TagManager from '@/components/tagManager';
import PathManager from '@/components/pathManager';
import getElement from '@/lib/getElement';
import UserVault from '@/lib/userVault';
import { inline, btnClassNames } from '@/lib/buttonToggleClasses';
import { Content } from '@/types';

function handleInputChange(item: Content, path: string[]) {
  const checkForChange: ((item: Content) => boolean)[] = [
    (item) => title === item.title,
    () => !!pwd,
    () => UserVault.currentDir.join(',') === path.join(','),
  ];
  console.log(path, UserVault.currentDir)

  const title = getElement<HTMLInputElement>('#itemSettingsTitle').value;
  const pwd = document.querySelector<HTMLInputElement>(
    '#itemSettingsPassword'
  )?.value;
  const submitBtn = getElement<HTMLButtonElement>('#itemSettingsSubmitBtn');
  const disableBtn = checkForChange.some(check => check(item));
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

// FIX ME autofocus modal when opened
export default function ItemSettings({ item }: { item: Content }) {
  let path = [ ...UserVault.currentDir ];
  return (
    <div className='flex flex-col gap-4'>
      {(item.type === 'folder' || item.type === 'link') && (
        <>
          <form className='grid grid-cols-3 gap-4'
            onSubmit={async (e) => {
              e.preventDefault();
              const title = getElement<HTMLInputElement>(
                '#itemSettingsTitle'
              ).value;
              const password = document.querySelector<HTMLInputElement>(
                '#itemSettingsPassword'
              )?.value;
              if (item.type === 'folder' && password) {
                await UserVault.encryptFolder(item, password);
              }
              if (title !== item.title) UserVault.rename(item.title, title);
              closeModal();
            }}
          >
            <label className='m-auto'
              htmlFor='itemSettingsTitle'
            >Name</label>
            <input className='defaultBorder col-span-2'
              id='itemSettingsTitle'
              type='text'
              disabled={!item.title}
              value={item.title}
              placeholder={item.title || 'Home Directory'}
              onInput={() => handleInputChange(item, path)}
            />
            {item.type === 'folder' && (
              <>
                <label className='m-auto'
                  htmlFor='itemSettingsPassword'
                >Password</label>
                <input className='defaultBorder col-span-2'
                  id='itemSettingsPassword'
                  type='password'
                  placeholder='Do not encrypt'
                  onInput={() => handleInputChange(item, path)}
                />
              </>
            )}
            {/*
            <label className='m-auto'
              htmlFor='itemSettingsPath'
            >Location</label>
            <div className='defaultBorder'
              id='itemSettingsPaths'
            >
              {UserVault.currentDir.map(segment => (
                <div>{segment}</div>
              ))}
            </div>
            <input className='defaultBorder col-span-2'
              type='text'
              value={`/${UserVault.currentDir.join('/')}`}
              onInput={(e) => {
                const errorMsg = getElement('#itemSettingsPathError');
                errorMsg.textContent = '';
                const path = e.currentTarget.value.split('/').filter(Boolean);
                let dir: ReturnType<typeof UserVault.getCurrentDir>
                try {
                  dir = UserVault.getCurrentDir(path, 'preserve');
                } catch {
                  return errorMsg.textContent = 'path does not exist';
                }
                if (!dir) throw Error('vault is null');
                if (dir.type === 'encryptedFolder') {
                  return errorMsg.textContent = 'dir is encrypted';
                }
                handleInputChange(item);
              }}
            />
            <div className='text-red-500 font-semibold text-center col-span-full'
              id='itemSettingsPathError'
            ></div>
            */}
            <PathManager path={path}
              changeHandler={() => handleInputChange(item, path)}
            />
            <button className={`bg-fg text-bg col-span-3 rounded-lg p-2 ${inline('animate')} ${inline('disabled')}`}
              id='itemSettingsSubmitBtn'
              type='submit'
              disabled={true}
            >Save</button>
          </form>
          <hr className='col-span-3' />
          <TagManager item={item} />
          <hr className='col-span-3' />
        </>
      )}
      <span className='text-center font-semibold truncate'>
        Delete {item.type}: {item.title}
      </span>
      <DeleteConfirmation item={item} />
    </div>
  )
}
