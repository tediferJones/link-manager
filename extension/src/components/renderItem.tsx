import LinkItem from '@/components/items/linkItem';
import FolderItem from '@/components/items/folderItem';
import EncryptedFolderItem from '@/components/items/encryptedFolderItem';
import WatchedItem from '@/components/items/watchedItem';
import { Content, ContentTypes, RenderOpts } from '@/types';

const renderOpts: RenderOpts = {
  link: (item) => <LinkItem link={item} />,
  folder: (item) => <FolderItem folder={item} />,
  encryptedFolder: (item) => <EncryptedFolderItem encryptedFolder={item} />,
  watched: (item) => <WatchedItem watched={item} />,
}

export default function RenderItem<
  T extends ContentTypes
>({ item }: { item: Content<T> }) {
  return renderOpts[item.type](item);
}
