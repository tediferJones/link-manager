import { ChevronDown, ChevronUp, Eye, Link2, Pin, Settings2 } from 'lucide';
import Icon from '@/components/icon';
import ItemSettings from '@/components/itemSettings';
import { openModal } from '@/components/modal';
import UserVault from '@/lib/userVault';
import { Content } from '@/types';

export default function LinkItem({ link }: { link: Content<'link'> }) {
  return (
    <div className='flex gap-4 defaultBorder bg-fg text-bg'>
      <a className='flex-1 flex gap-2 overflow-hidden'
        title={`Go to: ${link.href}`}
        href={link.href}
      >
        {link.pinned && (
          <Icon name={Pin} className='stroke-green-500' />
        )}
        <div className='flex-shrink-0'>
          <Icon name={Link2} />
        </div>
        <span className='truncate'>{link.title}</span>
      </a>
      {!link.pinned && (
        <>
          <button onClick={() => {
            UserVault.swapPriority(UserVault.getItemPath(link), -1);
          }}>
            <Icon name={ChevronUp} />
          </button>
          <button onClick={() => {
            UserVault.swapPriority(UserVault.getItemPath(link), 1);
          }}>
            <Icon name={ChevronDown} />
          </button>
        </>
      )}
      <button className='transition-all duration-300'
        onClick={() => UserVault.toggleWatched(
          UserVault.getItemPath(link),
          true
        )}
      >
        <Icon name={Eye} />
      </button>
      <button title={`Link Settings: ${link.title}`}
        onClick={() => {
          openModal(
            'Link Settings',
            <ItemSettings item={link} />
          )
        }}>
        <Icon name={Settings2} />
      </button>
    </div>
  )
}
