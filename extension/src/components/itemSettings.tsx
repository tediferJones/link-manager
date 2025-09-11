import { closeModal } from '@/components/modal';
import DeleteConfirmation from '@/components/deleteConfirmation';
import TagManager from '@/components/tagManager';
import getElement from '@/lib/getElement';
import UserVault from '@/lib/userVault';
import { inline, btnClassNames } from '@/lib/buttonToggleClasses';
import { AnyContent } from '@/types';

const tagChanges = { add: [] as string[], remove: [] as string[] };

function handleInputChange(folder: AnyContent) {
  const title = getElement<HTMLInputElement>('#folderSettingsTitle').value;
  const pwd = document.querySelector<HTMLInputElement>(
    '#folderSettingsPassword'
  )?.value;
  const submitBtn = getElement<HTMLButtonElement>('#folderSettingsSubmitBtn');
  const disableBtn = !(title !== folder.title || pwd || tagChanges.add.length || tagChanges.remove.length);
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

// function TagsDisplay({ item }: { item: Content<'link'> }) {
//   const currentTags = item.tags.concat(tagChanges.add).filter(
//     tag => !tagChanges.remove.includes(tag)
//   );
//   console.log(item.tags, tagChanges, currentTags)
//   return (
//     <>
//       {currentTags.map(tag => (
//         <span className='bg-fg text-bg py-1 px-2 rounded-lg flex gap-2'>
//           {tag}
//           <button type='button'
//             onClick={() => {
//               console.log('triggered delete')
//               tagChanges.remove.push(tag);
//               const tagContainer = getElement('#tagsDisplayContainer');
//               tagContainer.innerHTML = '';
//               tagContainer.append(<TagsDisplay item={item} />);
//               handleInputChange(item);
//             }}
//           >
//             <Icon name={X} />
//           </button>
//         </span>
//       ))}
//     </>
//   )
// }

// setInterval(() => {
//   console.log('tagChanges', tagChanges)
// }, 5000)

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
              if (tagChanges.add.length) {
                UserVault.addTags(item.title, tagChanges.add);
              }
              if (tagChanges.remove.length) {
                UserVault.removeTags(item.title, tagChanges.remove);
              }
              tagChanges.add = [];
              tagChanges.remove = [];
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
            {/*
            {item.type === 'link' && (
              // FIX ME
              // add auto-complete for easier tag matching (see vault.getExistingTags)
              // consider moving input inside of tagsDisplayContainer
              // also consider moving tagsDisplay to its own component
              <form className='col-span-full grid grid-cols-3 gap-4'
                onSubmit={(e) => {
                  e.preventDefault();
                  const newTagInput = getElement<HTMLInputElement>(
                    '#newTagInput'
                  );
                  if (!newTagInput.value) return;
                  tagChanges.add.push(newTagInput.value);
                  newTagInput.value = '';
                  const tagContainer = getElement('#tagsDisplayContainer');
                  tagContainer.innerHTML = '';
                  tagContainer.append(<TagsDisplay item={item} />);
                  handleInputChange(item);
                }}>
                <label className='m-auto'
                  htmlFor='newTagInput'
                >New Tag</label>
                <input className='defaultBorder col-span-2'
                  id='newTagInput'
                  type='text'
                />
                <div className='defaultBorder col-span-full flex flex-wrap gap-2'
                  id='tagsDisplayContainer'
                >
                  <TagsDisplay item={item} />
                </div>
              </form>
            )}
            */}
            <button className={`bg-fg text-bg col-span-3 rounded-lg p-2 ${inline('animate')} ${inline('disabled')}`}
              id='folderSettingsSubmitBtn'
              type='submit'
              disabled={true}
            >Save</button>
          </form>
          <hr className='col-span-3' />
          {item.type === 'link' && (
            <>
              <TagManager item={item} />
              <hr className='col-span-3' />
            </>
          )}
        </>
      )}
      <span className='text-center font-semibold truncate'>
        Delete {item.type}: {item.title}
      </span>
      <DeleteConfirmation item={item} />
    </div>
  )
}
