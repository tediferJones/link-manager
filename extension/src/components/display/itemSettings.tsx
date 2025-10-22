import {
  DeleteItem,
  TagEditor,
  PathEditor,
  EditItem,
} from '@/components/forms';
import { Checkbox } from '@/components/ui';
import { openModal } from '@/effects/modal';
import UserVault from '@/lib/app/userVault';
import { Content } from '@/types';

// FIX ME autofocus modal when opened
// FIX ME make labels bigger and thus easier to click on
//  - right now if you hover over them in inspect mode they occupy the minimum amount of space
// FIX ME add hotkeys for Move and Delete
//  - M for Move
//  - D for Delete
//  - C for Copy
export default function ItemSettings({ item }: { item: Content }) {
  return (
    <div className='flex flex-col gap-4'>
      {(item.type !== 'encryptedFolder') && (
        <>
          <EditItem item={item} />
          <hr className='col-span-full' />
          {/* 
          // FIX ME move this to own component
          // Make it extendable, might be a good play to add other checkbox later
          // maybe name it ItemToggles
          */}
          <div className='col-span-full flex gap-2 items-center justify-center'>
            <label htmlFor='itemSettingsPinned'>Pinned:</label>
            <Checkbox id='itemSettingsPinned'
              checked={item.pinned}
              onChange={async (e) => {
                (await UserVault.togglePinned(
                  UserVault.getItemPath(item),
                  e.currentTarget.checked
                )).throw();
              }}
            />
          </div>
          <hr className='col-span-full' />
          <TagEditor item={item} />
          <hr className='col-span-full' />
          <PathEditor item={item} path={UserVault.getViewPath()} />
          <hr />
        </>
      )}
      <div className='flex gap-2 justify-stretch'>
        <button className='flex-1 bg-fg text-bg p-2 rounded-lg'
          onClick={async () => {
            (await UserVault.copy(UserVault.getItemPath(item))).throw();
          }}
        >
          Copy
        </button>
        <button className='flex-1 bg-red-500 p-2 rounded-lg'
          onClick={() => openModal(
            `Delete ${item.title}`,
            <DeleteItem item={item} />
          )}
        >Delete</button>
      </div>
    </div>
  )
}
