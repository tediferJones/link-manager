import { Settings2 } from 'lucide';
import UserVault from '@/lib/userVault';
import Icon from '@/components/icon';
import { openModal } from '@/components/modal';
import FolderSettings from '@/components/folderSettings';

export default function Breadcrumbs() {
  return (
    // FIX ME this should scroll side to side without a scroll bar
    // would be nice to add an ellipse to whichever side is overflowing
    // also maybe change '~' to a little house icon to indicate home
    // and maybe change '/' to little chevrons
    <div className='flex justify-between items-center text-lg'>
      <div className='flex gap-2 overflow-hidden font-semibold'>
        {[ '~', ...UserVault.currentDir ].map((key, i, arr) => (
          <>
            <span className='underline cursor-pointer text-primary'
              onClick={() => UserVault.setDir(arr.slice(1, i + 1))}
            >{key}</span>
            <span>/</span>
          </>
        ))}
      </div>
      {/* FIX ME move this into directoryView so that each item has it's own settings button and make LinkSettings component */}
      <button className='defaultBorder'
        onClick={() => openModal(
          'Folder Settings',
          <FolderSettings />
        )}
      >
        <Icon name={Settings2} />
      </button>
    </div>
  )
}
