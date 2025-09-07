import { closeModal } from '@/components/modal';
import DeleteConfirmation from '@/components/deleteConfirmation';
import getElement from '@/lib/getElement';
import UserVault from '@/lib/userVault';
import { inline, btnClassNames } from '@/lib/buttonToggleClasses';
import { AnyContent } from '@/types';

function handleInputChange(folder: AnyContent) {
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

export default function ItemSettings({ item }: { item: AnyContent }) {
  return (
    <div className='flex flex-col gap-4'>
      {(item.type === 'folder' || item.type === 'link') && (
        <>
          <form className='grid grid-cols-3 gap-4'
            onSubmit={async (e) => {
              e.preventDefault();
              const title = getElement<HTMLInputElement>(
                '#folderSettingsTitle'
              ).value;
              const password = getElement<HTMLInputElement>(
                '#folderSettingsPassword'
              ).value;
              if (item.type === 'folder' && password) {
                await UserVault.encryptFolder(item, password);
              }
              if (title !== item.title) UserVault.rename(item.title, title);
              closeModal();
            }}
          >
            <label className='m-auto'
              htmlFor='folderSettingsTitle'
            >Name</label>
            <input className='defaultBorder col-span-2'
              id='folderSettingsTitle'
              type='text'
              disabled={!item.title}
              value={item.title}
              placeholder={item.title || 'Home Directory'}
              onInput={() => handleInputChange(item)}
            />
            {item.type === 'folder' && (
              <>
                <label className='m-auto' htmlFor='folderSettingsPassword'>Password</label>
                <input className='defaultBorder col-span-2'
                  id='folderSettingsPassword'
                  type='password'
                  placeholder='Do not encrypt'
                  onInput={() => handleInputChange(item)}
                />
              </>
            )}
            <button className={`bg-fg text-bg col-span-3 rounded-lg p-2 ${inline('animate')} ${inline('disabled')}`}
              id='folderSettingsSubmitBtn'
              type='submit'
              disabled={true}
            >Save</button>
          </form>
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
