import { Autocomplete } from '@/components/ui';
import TagDisplay from '@/components/tagDisplay';
import getElement from '@/lib/utils/getElement';
import UserVault from '@/lib/app/userVault';
import { Content } from '@/types';

// FIX ME compare to pathManager, try to make this as similar as possible
// FIX ME rename to TagEditor

export default function TagManager(
  {
    item,
  }: {
    item: Content<'folder' | 'link' | 'watched'>,
  }
) {
  const autocompleteId = 'newTagInput';
  const tagContainerId = 'tagsContainer';
  const tagEditorId = 'tagEditorForm';

  setTimeout(() => {
    getElement(`#${tagEditorId}`).addEventListener(
      'autocompleteSubmit',
      () => getElement(`#${tagContainerId}`).replaceChildren(
        <TagDisplay item={item} />
      )
    );
  });

  return (
    <form className='grid grid-cols-3 gap-4'
      id={tagEditorId}
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
