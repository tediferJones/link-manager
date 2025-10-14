import { Autocomplete } from '@/components/ui';
import TagDisplay from '@/components/TagDisplay';
import getElement from '@/lib/utils/getElement';
import UserVault from '@/lib/app/userVault';
import { Content } from '@/types';

// FIX ME compare to pathManager, try to make this as similar as possible

export default function TagManager(
  {
    item,
  }: {
    item: Content<'folder' | 'link' | 'watched'>,
  }
) {
  const autocompleteId = 'newTagInput';
  const tagContainerId = 'tagsContainer';

  return (
    <form className='grid grid-cols-3 gap-4'
      onSubmitCapture={(e) => {
        e.preventDefault();
        getElement(`#${tagContainerId}`).replaceChildren(
          <TagDisplay item={item} />
        );
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
          const existingTags = (await UserVault.query(
            [],
            (extTags, item) => {
              if (item.type !== 'encryptedFolder') {
                return extTags.concat(item.tags);
              }
              return extTags;
            },
            [] as string[]
          )).throw().data();

          // FIX ME move this logic into the query function
          // no need to return results we're just gunna filter out anyways
          return existingTags.filter(existingTag => {
            if (item.tags.includes(existingTag)) return;
            return existingTag.toLowerCase().includes(tagValue);
          });
        }}
      />
    </form>
  )
}
