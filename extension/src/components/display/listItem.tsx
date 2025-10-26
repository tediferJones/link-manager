import {
  Folder,
  FolderKey,
  FolderLock,
  IconNode,
  Link2,
  Pin,
  Settings2,
} from 'lucide';
import { ItemSettings } from '@/components/display';
import { Icon } from '@/components/ui';
import { openModal } from '@/effects';
import UserVault from '@/lib/app/userVault';
import { Content, ContentTypes } from '@/types';

// FIX ME try to tie extraAttrs to props of its tag type
// FIX ME rename extraAttrs to props
type ItemTypes = {
  [K in ContentTypes]: {
    className?: string,
    icon: (item: Content<K>) => IconNode,
    tag: 'a' | 'button',
    extraAttrs?: (item: Content<K>) => Object,
  }
}

export default function ListItem({ item }: { item: Content }) {
  const itemTypes: ItemTypes = {
    link: {
      className: 'bg-fg text-bg',
      icon: () => Link2,
      tag: 'a',
      extraAttrs: (item) => ({
        title: `Go to: ${item.href}`,
        href: item.href,
      })
    },
    watched: {
      className: 'bg-fg text-bg opacity-50',
      icon: () => Link2,
      tag: 'a',
      extraAttrs: (item) => ({
        title: `Go to: ${item.href}`,
        href: item.href,
      }),
    },
    folder: {
      icon: (item) => item.encryption ? FolderKey : Folder,
      tag: 'button',
      extraAttrs: (item) => ({
        title: `Enter folder: ${item.title}`,
        onClick: () => UserVault.setDir(UserVault.getItemPath(item)),
      }),
    },
    encryptedFolder: {
      icon: () => FolderLock,
      tag: 'button',
      extraAttrs: (item) => ({
        title: `Enter encrypted folder: ${item.title}`,
        onClick: () => UserVault.setDir(UserVault.getItemPath(item)),
      }),
    }
  }

  const { className, icon, tag, extraAttrs } = itemTypes[item.type];
  const Wrapper = tag;
  const type = item.type[0].toUpperCase + item.type.slice(1);
  return (
    <div className={`flex gap-4 default-border ${className || ''}`}>
      <Wrapper className='flex-1 flex gap-2 cursor-pointer overflow-hidden'
        {...extraAttrs}
      >
        {item.pinned && <Icon name={Pin} className='stroke-green-500' />}
        <Icon name={icon(item as any)} />
        <span className='truncate'>{item.title}</span>
      </Wrapper>
      <button title={`${type} Settings: ${item.title}`}
        onClick={() => {
          openModal(
            `${type} Settings`,
            <ItemSettings item={item} />
          )
        }}>
        <Icon name={Settings2} />
      </button>
    </div>
  )
}
