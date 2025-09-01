import { Folder, Link2, Settings2 } from 'lucide';
import { UserVault } from '@/app';
import Breadcrumbs from '@/components/breadcrumbs';
import Icon from '@/components/icon';
import Loading from '@/components/loading';
import { FolderContents } from '@/types';

export default function DirectoryView(
  {
    contents
  }: {
    contents?: FolderContents
  }
) {
  return !contents ? <Loading /> :
    <>
      <Breadcrumbs />
      <hr className='border-1' />
      {!Object.keys(contents).length ? 
        <div className='text-xl font-bold text-gray-500 text-center p-4'>
          No Contents
        </div> :
        Object.values(contents).map(item => {
          // FIX ME stick this junk in an object and/or separate into individual components
          if (item.type === 'link') {
            return <div className='flex justify-between gap-2 defaultBorder bg-fg text-bg'>
              <a className='flex-1 flex gap-2'
                title={item.href}
                href={item.href}
              >
                <Icon name={Link2} />
                <span>{item.title}</span>
              </a>
              <Icon name={Settings2} />
            </div>
          } else if (item.type === 'folder') {
            return <div className='flex justify-between gap-2 defaultBorder'
              onClick={() => UserVault.setDir(
                UserVault.currentDir.concat(item.title)
              )}
            >
              <span className='flex-1 flex gap-2 cursor-pointer'
                title='Enter folder'
              >
                <Icon name={Folder} />
                <span>{item.title}</span>
              </span>
              <Icon name={Settings2} />
            </div>
          } else {
            // Encrypted folder will turn into a normal folder once decrypted
            return <div>Encrypted Folder: {item.title}</div>
          }
        })
      }
    </>
}
