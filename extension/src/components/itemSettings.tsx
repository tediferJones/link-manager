import { Plus, X } from 'lucide';
import { closeModal } from '@/components/modal';
import DeleteConfirmation from '@/components/deleteConfirmation';
import Icon from '@/components/icon';
import getElement from '@/lib/getElement';
import UserVault from '@/lib/userVault';
import { inline, btnClassNames } from '@/lib/buttonToggleClasses';
import { AnyContent } from '@/types';

const tags = { add: [] as string[], remove: [] as string[] };

function handleInputChange(folder: AnyContent) {
  const title = getElement<HTMLInputElement>('#folderSettingsTitle').value;
  const pwd = document.querySelector<HTMLInputElement>(
    '#folderSettingsPassword'
  )?.value;
  const submitBtn = getElement<HTMLButtonElement>('#folderSettingsSubmitBtn');
  const disableBtn = !(title !== folder.title || pwd || tags.add.length || tags.remove.length);
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

// function TagsDisplay({ link }: { link: Content<'link'> }) {
//   console.log('tags', link.tags.concat(tags.add).filter(tag => !tags.remove.includes(tag)))
//   return link.tags.concat(tags.add).filter(tag => tags.remove.includes(tag)).map(tag => (
//     <span className='bg-fg text-bg py-1 px-2 rounded-lg flex gap-2'>
//       {tag}
//       <button type='button'
//         onClick={() => tags.remove.push(tag)}
//       >
//         <Icon name={X} />
//       </button>
//     </span>
//   ));
// }

// FIX ME autofocus modal when opened
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
              const password = document.querySelector<HTMLInputElement>(
                '#folderSettingsPassword'
              )?.value;
              if (item.type === 'folder' && password) {
                await UserVault.encryptFolder(item, password);
              }
              if (title !== item.title) UserVault.rename(item.title, title);
              if (tags.add.length) {
                UserVault.addTags(item.title, tags.add);
              }
              if (tags.remove.length) {
                UserVault.addTags(item.title, tags.remove);
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
              disabled={!item.title}
              value={item.title}
              placeholder={item.title || 'Home Directory'}
              onInput={() => handleInputChange(item)}
            />
            {item.type === 'folder' && (
              <>
                <label className='m-auto'
                  htmlFor='folderSettingsPassword'
                >Password</label>
                <input className='defaultBorder col-span-2'
                  id='folderSettingsPassword'
                  type='password'
                  placeholder='Do not encrypt'
                  onInput={() => handleInputChange(item)}
                />
              </>
            )}
            {item.type === 'link' && (
              <>
                {/*
                <label className='m-auto'
                  htmlFor='addTag'
                >Tag</label>
                <input className='defaultBorder col-span-2'
                  type='text'
                />
                */}
                <div className='defaultBorder col-span-full flex flex-wrap gap-2'>
                  {item.tags.map(tag => (
                    <span className='bg-fg text-bg p-1 rounded-lg flex items-center w-min'>
                      <span>{tag}</span>
                      <button>
                        <Icon name={X} />
                      </button>
                    </span>
                  ))}
                  <button type='button'>
                    <Icon name={Plus}/>
                  </button>
                </div>
              </>
            )}
            {/*
            {item.type === 'link' && (
              <div className='defaultBorder col-span-3 flex flex-wrap gap-2 items-center'
                id='tagForm'
              >
                <TagsDisplay link={item} />
                <button
                  id='tagAddBtn'
                  type='button'
                  onClick={() => {
                    getElement('#tagForm').appendChild(
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const addTagInput = getElement<HTMLInputElement>(
                          '#addTagInput'
                        );
                        tags.add.push(addTagInput.value);
                        handleInputChange(item);
                        addTagInput.value = '';
                        const tagForm = getElement('#tagForm')
                        tagForm.querySelectorAll('.tag').forEach(e => e.remove());
                        tagForm.prepend(<TagsDisplay link={item} />);
                      }}>
                        <input id='addTagInput' autoFocus />
                      </form>
                    );
                    getElement<HTMLInputElement>('#addTagInput').focus();
                  }}>
                  <Icon name={Plus} />
                </button>
              </div>
            )}
            */}
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
