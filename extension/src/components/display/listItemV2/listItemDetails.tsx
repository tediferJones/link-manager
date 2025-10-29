import { ChevronDown, ChevronUp, Eye, Lock } from 'lucide';
import { ReactNode } from 'jsx-dom';
import { Icon } from '@/components/ui';
import UserVault from '@/lib/app/userVault';
import { Content, ContentTypes } from '@/types';

// FIX ME move to types file
type ItemDetails = {
  [K in ContentTypes]: (item: Content<K>) => ReactNode
}

export default function ListItemDetails<T extends ContentTypes>(
  {
    item,
  }: {
    item: Content<T>,
  }
) {
  const itemDetails: ItemDetails = {
    link: (item) => (
      <>
        {!item.pinned && (
          <>
            <button onClick={() => {
              UserVault.swapPriority(UserVault.getItemPath(item), -1);
            }}>
              <Icon name={ChevronUp} />
            </button>
            <button onClick={() => {
              UserVault.swapPriority(UserVault.getItemPath(item), 1);
            }}>
              <Icon name={ChevronDown} />
            </button>
          </>
        )}
        <button className='transition-all duration-300'
          onClick={() => UserVault.toggleWatched(
            UserVault.getItemPath(item),
            true
          )}
        >
          <Icon name={Eye} />
        </button>
      </>
    ),
    watched: (item) => (
      <button className='transition-all duration-300 opacity-100'
        onClick={() => UserVault.toggleWatched(
          UserVault.getItemPath(item),
          false
        )}
      >
        <Icon name={Eye} />
      </button>
    ),
    folder: (item) => (
      item.encryption && (
        <button onClick={async () => {
          (await UserVault.encrypt(UserVault.getItemPath(item))).throw();
        }}>
          <Icon name={Lock} />
        </button>
      )
    ),
    encryptedFolder: () => undefined,
  }

  return itemDetails[item.type](item);
}
