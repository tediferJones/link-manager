import { closeModal, navigateModal } from '@/components/modal';
import DeleteConfirmation from '@/components/deleteConfirmation';
import PathManager from '@/components/pathManager';
import TagManager from '@/components/tagManager';
import Checkbox from '@/components/checkbox';
import ErrorMsg, { hideError, showError } from '@/components/errorMsg';
import getElement from '@/lib/getElement';
import UserVault from '@/lib/userVault';
import { inline, btnClassNames } from '@/lib/buttonToggleClasses';
import { Content } from '@/types';

function handleInputChange(item: Content) {
  const checkForChange: ((item: Content) => boolean)[] = [
    (item) => title === item.title,
    () => !pwd,
  ];

  const title = getElement<HTMLInputElement>('#itemSettingsTitle').value;
  const pwd = document.querySelector<HTMLInputElement>(
    '#itemSettingsPassword'
  )?.value;
  const submitBtn = getElement<HTMLButtonElement>('#itemSettingsSubmitBtn');
  const disableBtn = checkForChange.every(check => check(item));
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
// FIX ME add hotkeys for Move and Delete
//  - M for Move
//  - D for Delete
//  - C for Copy
export default function ItemSettings({ item }: { item: Content }) {
  const renameErrorId = 'itemSettingsRenameError';
  return (
    <div className='flex flex-col gap-4'>
      {(item.type === 'folder' || item.type === 'link' || item.type === 'watched') && (
        <>
          <form className='grid grid-cols-3 gap-4'
            onSubmit={async (e) => {
              e.preventDefault();
              hideError(renameErrorId);
              const title = getElement<HTMLInputElement>(
                '#itemSettingsTitle'
              ).value;
              const password = document.querySelector<HTMLInputElement>(
                '#itemSettingsPassword'
              )?.value;
              if (item.type === 'folder' && password) {
                const enableResult = await UserVault.enableEncryption(
                  UserVault.currentDir.concat(item.title),
                  password
                );
                if (!enableResult.success) throw Error(enableResult.error);
              }
              if (title !== item.title) {
                const result = await UserVault.rename(
                  title, UserVault.currentDir.concat(item.title)
                );
                if (!result.success) {
                  return showError(renameErrorId, result.error);
                }
              }
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
              onInput={() => handleInputChange(item)}
            />
            <ErrorMsg id={renameErrorId} />
            {item.type === 'folder' && (
              <>
                <label className='m-auto'
                  htmlFor='itemSettingsPassword'
                >Password</label>
                <input className='defaultBorder col-span-2'
                  id='itemSettingsPassword'
                  type='password'
                  placeholder='Do not encrypt'
                  onInput={() => handleInputChange(item)}
                />
              </>
            )}
            <button className={`bg-fg text-bg col-span-3 rounded-lg p-2 ${inline('animate')} ${inline('disabled')}`}
              id='itemSettingsSubmitBtn'
              type='submit'
              disabled={true}
            >Save</button>
          </form>
          <hr className='col-span-full' />
          <div className='col-span-full flex gap-2 items-center justify-center'>
            <label htmlFor='itemSettingsPinned'>Pinned:</label>
            <Checkbox id='itemSettingsPinned'
              checked={item.pinned}
              onChange={(e) => {
                UserVault.setPinned(item.title, e.currentTarget.checked);
              }}
            />
          </div>
          <hr className='col-span-full' />
          <TagManager item={item} />
          <hr className='col-span-full' />
          <PathManager item={item} />
          <hr />
        </>
      )}
      <div className='flex gap-2 justify-stretch'>
        <button className='flex-1 bg-fg text-bg p-2 rounded-lg'
          onClick={async () => {
            const copyResult = await UserVault.copy(
              UserVault.currentDir.concat(item.title)
            );
            if (!copyResult.success) throw Error(copyResult.error);
          }}
        >
          Copy
        </button>
        <button className='flex-1 bg-red-500 p-2 rounded-lg'
          onClick={() => {
            navigateModal(
              `Delete ${item.title}`,
              <DeleteConfirmation item={item} />,
              {
                title: 'Settings',
                element: <ItemSettings item={item} />,
              }
            );
          }}
        >Delete</button>
      </div>
    </div>
  )
}
