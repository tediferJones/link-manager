import { Folder, FolderKey, FolderLock, IconNode, Link2, Pin } from 'lucide';
import { Icon } from '@/components/ui';
import { Content, ContentTypes } from '@/types';

// FIX ME move to types file
type ItemIcon = {
  [K in ContentTypes]: (item: Content<K>) => IconNode
}

export default function ListItemCore<T extends ContentTypes>(
  {
    item,
  }: {
    item: Content<T>,
  }
) {
  const itemIcon: ItemIcon = {
    link: () => Link2,
    watched: () => Link2,
    folder: (item) => item.encryption ? FolderKey : Folder,
    encryptedFolder: () => FolderLock,
  };

  return (
    <>
      {item.pinned && <Icon name={Pin} className='stroke-green-500' />}
      <Icon name={itemIcon[item.type](item)} />
      <span className='truncate'>{item.title}</span>
    </>
  )
}
