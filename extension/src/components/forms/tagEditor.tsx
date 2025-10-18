import { Autocomplete, Tag } from '@/components/ui';
import getElement from '@/lib/utils/getElement';
import UserVault from '@/lib/app/userVault';
import { Content } from '@/types';

// FIX ME compare to pathManager, try to make this as similar as possible
// FIX ME do we want to add a submit button?
//  - Maybe just a little plus sign next to the input

function TagDisplay(
  {
    item,
  }: {
    item: Content<'folder' | 'link' | 'watched'>,
  }
) {
  return !item.tags.length ? (
    <div className='m-auto text-muted font-bold'>
      No Tags
    </div>
  ) : (
      <>
        {item.tags.map(tag => (
          <Tag value={tag} xFunc={async () => {
            (await UserVault.editTags(
              UserVault.getItemPath(item),
              'delete',
              tag,
            )).throw();
          }} />
        ))}
      </>
    )
}

// FIX ME move to constants
export const autocompleteId = 'newTagInput';
export const tagContainerId = 'tagsContainer';
export const tagEditorId = 'tagEditorForm';

export default function TagEditor(
  {
    item,
  }: {
    item: Content<'folder' | 'link' | 'watched'>,
  }
) {
  function updateTagDisplay() {
    getElement(`#${tagContainerId}`).replaceChildren(
      <TagDisplay item={item} />
    );
  }

  setTimeout(() => {
    getElement(`#${tagEditorId}`).addEventListener(
      'autocompleteSubmit',
      updateTagDisplay,
    );
  });

  return (
    <form className='grid grid-cols-3 gap-4'
      id={tagEditorId}
      onSubmit={(e) => {
        e.preventDefault();
        updateTagDisplay();
      }}
    >
      <div className='defaultBorder flex gap-2 flex-wrap justify-stretch col-span-full'
        id={tagContainerId}
      >
        <TagDisplay item={item} />
      </div>
      <label className='m-auto'
        htmlFor='newTagInput'
      >Add Tag</label>
      <Autocomplete id={autocompleteId}
        placeholder='New tag'
        containerClassName='col-span-2'
        onSubmit={async () => {
          const tagInput = getElement<HTMLInputElement>(`#${autocompleteId}`);
          const newTag = tagInput.value;
          (await UserVault.editTags(
            UserVault.path.concat(item.title),
            'add',
            newTag,
          )).throw();
          tagInput.value = '';
        }}
        generator={async (e) => {
          const tagValue = e.currentTarget.value.toLowerCase();
          return (await UserVault.query(
            [],
            (extTags, queryItem) => {
              if (queryItem.type === 'encryptedFolder') return extTags;
              const matchingTags = queryItem.tags.filter(tag => {
                if (extTags.includes(tag)) return;
                if (item.tags.includes(tag)) return;
                return tag.toLowerCase().includes(tagValue);
              });
              return extTags.concat(matchingTags);
            },
            [] as string[]
          )).throw().data();
        }}
      />
    </form>
  )
}
