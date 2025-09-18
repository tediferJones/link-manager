import { X } from 'lucide';
import Icon from '@/components/icon';
import getElement from '@/lib/getElement';
import UserVault from '@/lib/userVault';
import { Content } from '@/types';

export default function TagManager(
  {
    item,
  }: {
    item: Content<'link' | 'folder' | 'watched'>,
  }
) {
  function refreshTags() {
    const container = getElement('#tagsContainer');
    container.innerHTML = '';
    container.appendChild(<TagsDisplay />);
  }

  function TagsDisplay() {
    return (
      <>
        {!item.tags.length ? <div className='flex-1 text-center text-muted font-bold'>
          No Tags
        </div> : item.tags.map(tag => (
          <span className='bg-fg text-bg py-1 px-2 rounded-lg flex gap-2'>
            {tag}
            <button type='button'
              onClick={() => {
                UserVault.removeTags(item.title, [ tag ]);
                refreshTags();
              }}
            >
              <Icon name={X} />
            </button>
          </span>
        ))}
      </>
    )
  }

  function addTag(newTag: string) {
    console.log('newTag', newTag)
    UserVault.addTags(item.title, [ newTag ]);
    const newTagInput = getElement<HTMLInputElement>('#newTagInput');
    newTagInput.value = '';
    const suggestionContainer = getElement('#newTagSuggestions');
    suggestionContainer.innerHTML = '';
    suggestionContainer.classList.add('hidden');
    refreshTags();
  }

  return (
    <form className='grid grid-cols-3 gap-4'
      onSubmit={(e) => {
        e.preventDefault();
        console.log('submitting')
        const newTagInput = getElement<HTMLInputElement>('#newTagInput');
        addTag(newTagInput.value);
      }}
    >
      <div className='defaultBorder flex gap-2 flex-wrap justify-stretch col-span-full'
        id='tagsContainer'
      >
        <TagsDisplay />
      </div>
      <label className='m-auto'
        htmlFor='newTagInput'
      >Add Tag</label>
      <div className='col-span-2 relative'>
        <input className='defaultBorder w-full'
          id='newTagInput'
          type='text'
          placeholder='New Tag'
          onInput={(e) => {
            const newTag = e.currentTarget.value.toLowerCase();
            const extTags = UserVault.getExistingTags();
            if (!extTags) return;
            // FIX ME
            // filter out tags that are already associate with the item
            const tagSuggestions = extTags.filter(extTag => {
              if (item.tags.includes(extTag)) return;
              return extTag.toLowerCase().includes(newTag);
            });
            const suggestionContainer = getElement('#newTagSuggestions');
            if (newTag && tagSuggestions.length) {
              suggestionContainer.classList.add('flex');
              suggestionContainer.classList.remove('hidden');
              suggestionContainer.innerHTML = '';
              suggestionContainer.append(
                <>
                  {tagSuggestions.map((tag, i) => (
                    <>
                      {i > 0 && <hr />}
                      <button className='focus:bg-secondary rounded-lg ring-red-500'
                        type='button'
                        onClick={() => addTag(tag)}
                      >{tag}</button>
                    </>
                  ))}
                </>
              )
            } else {
              suggestionContainer.classList.add('hidden');
              suggestionContainer.classList.remove('flex');
            }
          }}
          required
        />
        {/*
        FIX ME
        What happens when there are like 50 tags?
        Will it overflow the screen?
        Can we add a scroll bar if it overflows the screen?
        Worse case just limit results to like 5 suggestions
        */}
        <div className='z-10 hidden absolute mt-2 defaultBorder bg-bg w-full flex-col gap-1'
          id='newTagSuggestions'
        ></div>
      </div>
    </form>
  )
}
