import { Eye, Link2, Pin, Settings2 } from 'lucide';
import { ItemSettings } from '@/components/display';
import { Icon } from '@/components/ui';
import { openModal } from '@/effects';
import UserVault from '@/lib/app/userVault';
import { Content } from '@/types';

export default function WatchedItem({ watched }: { watched: Content<'watched'> }) {
  return (
    <div className='flex gap-4 defaultBorder bg-fg text-bg opacity-50'>
      <a className='flex-1 flex gap-2 overflow-hidden'
        title={`Go to: ${watched.href}`}
        href={watched.href}
      >
        {watched.pinned && (
          <Icon name={Pin} className='stroke-green-500' />
        )}
        <div className='flex-shrink-0'>
          <Icon name={Link2} />
        </div>
        <span className='truncate'>{watched.title}</span>
      </a>
      <button className='transition-all duration-300 opacity-100'
        onClick={() => UserVault.toggleWatched(
          UserVault.getItemPath(watched),
          false
        )}
      >
        <Icon name={Eye} />
      </button>
      <button title={`Link Settings: ${watched.title}`}
        onClick={() => {
          openModal(
            'Watched Settings',
            <ItemSettings item={watched} />
          )
        }}>
        <Icon name={Settings2} />
      </button>
    </div>
  )
}
