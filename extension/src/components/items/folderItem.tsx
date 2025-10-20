import { FolderKey, Folder, Lock, Settings2, Pin } from 'lucide';
import { ItemSettings } from '@/components/display';
import { Icon } from '@/components/ui';
import { openModal } from '@/effects';
import UserVault from '@/lib/app/userVault';
import { Content } from '@/types';

export default function FolderItem({ folder }: { folder: Content<'folder'> }) {
  return (
    <div className='flex gap-4 defaultBorder'>
      <button className='flex-1 flex gap-2 cursor-pointer overflow-hidden'
        title={`Enter folder: ${folder.title}`}
        onClick={() => UserVault.setDir(UserVault.getItemPath(folder))}
      >
        {folder.pinned && (
          <Icon name={Pin} className='stroke-green-500' />
        )}
        <div className='flex-shrink-0'>
          <Icon name={folder.encryption ? FolderKey : Folder} />
        </div>
        <span className='truncate'>{folder.title}</span>
      </button>
      {folder.encryption && <button onClick={async () => {
        (await UserVault.encrypt(UserVault.getItemPath(folder))).throw();
      }}>
        <Icon name={Lock} />
      </button>}
      <button title={`Folder Settings: ${folder.title}`}
        onClick={() => {
          openModal(
            'Folder Settings',
            <ItemSettings item={folder} />
          )
        }}>
        <Icon name={Settings2} />
      </button>
    </div>
  )
}
