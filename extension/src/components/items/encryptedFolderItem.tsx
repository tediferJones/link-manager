import { FolderLock, Pin, Settings2 } from 'lucide';
import Icon from '@/components/icon';
import ItemSettings from '@/components/itemSettings';
import { openModal } from '@/components/modal';
import UserVault from '@/lib/app/userVault';
import { Content } from '@/types';

export default function EncryptedFolderItem(
  {
    encryptedFolder
  }: {
    encryptedFolder: Content<'encryptedFolder'>
  }
) {
  return (
    <div className='flex gap-4 defaultBorder'>
      <button className='flex-1 flex gap-2 cursor-pointer overflow-hidden'
        title={`Enter encrypted folder: ${encryptedFolder.title}`}
        onClick={() => UserVault.setDir(
          UserVault.getItemPath(encryptedFolder)
        )}
      >
        {encryptedFolder.pinned && (
          <Icon name={Pin} className='stroke-green-500' />
        )}
        <div className='flex-shrink-0'>
          <Icon name={FolderLock} />
        </div>
        <span className='truncate'>{encryptedFolder.title}</span>
      </button>
      <button title={`Encrypted Folder Settings: ${encryptedFolder.title}`}
        onClick={() => {
          openModal(
            'Encrypted Folder Settings',
            <ItemSettings item={encryptedFolder} />
          )
        }}>
        <Icon name={Settings2} />
      </button>
    </div>
  )
}
