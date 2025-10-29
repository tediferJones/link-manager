import { ReactNode } from 'jsx-dom';
import UserVault from '@/lib/app/userVault';
import { Content, ContentTypes } from '@/types';

// FIX ME move to types file
type ItemWrapper = {
  [K in ContentTypes]: (
    item: Content<K>,
    children: ReactNode,
    className: string,
  ) => ReactNode
}

export default function ListItemWrapper<T extends ContentTypes>(
  {
    item,
    children,
  }: {
    item: Content<T>,
    children: ReactNode,
  }
) {
  const itemWrapper: ItemWrapper = {
    link: (item, children, className) => (
      <a className={className}
        title={`Go to: ${item.href}`} href={item.href}
      >{children}</a>
    ),
    watched: (item, children, className) => (
      <a className={className}
        title={`Go to: ${item.href}`} href={item.href}
      >{children}</a>
    ),
    folder: (item, children, className) => (
      <button className={className}
        title={`Enter folder: ${item.title}`}
        onClick={() => UserVault.setDir(UserVault.getItemPath(item))}
      >{children}</button>
    ),
    encryptedFolder: (item, children, className) => (
      <button className={className}
        title={`Enter encrypted folder: ${item.title}`}
        onClick={() => UserVault.setDir(UserVault.getItemPath(item))}
      >{children}</button>
    ),
  }

  const className = 'flex-1 flex gap-2 cursor-pointer overflow-hidden';
  return itemWrapper[item.type](item, children, className);
}
