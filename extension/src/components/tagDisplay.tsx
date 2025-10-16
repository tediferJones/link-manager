import { Tag } from '@/components/ui';
import UserVault from '@/lib/app/userVault';
import { Content } from '@/types';

// FIX ME write tests for this component

export default function TagDisplay(
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
