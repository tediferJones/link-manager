import { UserVault } from '@/app';
import { FolderContents } from '@/types';

export default function DirectoryView(
  {
    contents
  }: {
    contents?: FolderContents
  }
) {
  return !contents ? <span>Loading</span> :
    !Object.values(contents).length ?
      <div className='text-xl font-bold text-gray-500 text-center p-4'>
        No Contents
      </div> :
      <>
        {Object.values(contents).map(item => {
          // FIX ME stick this junk in an object and/or separate into individual components
          if (item.type === 'link') {
            return <a className='flex justify-between gap-2 bg-gray-300 rounded-lg p-2'
              title={item.href}
              href={item.href}
            >
              <span className='flex gap-2'>
                <span>🔗</span>
                <span>{item.title}</span>
              </span>
              <span>⚙️</span>
            </a>
          } else if (item.type === 'folder') {
            return <div className='flex justify-between gap-2 bg-blue-500 rounded-lg p-2 cursor-pointer'
              title='Enter folder'
              onClick={() => UserVault.enterDir(item.title)}
            >
              <span className='flex gap-2'>
                <span>📁</span>
                <span>{item.title}</span>
              </span>
              <span>⚙️</span>
            </div>
          } else {
            // Encrypted folder will turn into a normal folder once decrypted
            return <div>Encrypted Folder: {item.title}</div>
          }
        })}
      </>
}
