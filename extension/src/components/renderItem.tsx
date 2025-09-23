import { ReactElement } from 'jsx-dom';
import LinkItem from '@/components/items/linkItem';
import FolderItem from '@/components/items/folderItem';
import EncryptedFolderItem from '@/components/items/encryptedFolderItem';
import WatchedItem from '@/components/items/watchedItem';
import { Content, ContentTypes } from '@/types';
import UserVault from '@/lib/userVault';

const renderOpts: { [K in ContentTypes]: (item: Content<K>) => ReactElement } = {
  link: (item) => <LinkItem link={item} />,
  folder: (item) => <FolderItem folder={item} />,
  encryptedFolder: (item) => <EncryptedFolderItem encryptedFolder={item} />,
  watched: (item) => <WatchedItem watched={item} />,
}

export default function RenderItem<T extends ContentTypes>(
  {
    item,
    moveItem,
  }: {
    item: Content<T>
    moveItem?: boolean,
  }
) {
  if (!moveItem && item === UserVault.toMove?.item) return;
  return renderOpts[item.type](item);
}
