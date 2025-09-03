import { Folder, FolderKey, FolderLock, Link2 } from 'lucide';
import UserVault from '@/lib/userVault';
import Breadcrumbs from '@/components/breadcrumbs';
import Icon from '@/components/icon';
import Loading from '@/components/loading';
import { Content, ContentTypes } from '@/types';

export default function DirectoryView() {
  const dir = UserVault.getCurrentDir();
  // const contents = UserVault.getCurrentDir()?.contents;

  // FIX ME seperate into individual components
  const renderItem: { [K in ContentTypes]: (item: Content<K>) => Element } = {
    link: (item) => (
      <a className='flex gap-2 defaultBorder bg-fg text-bg'
        title={item.href}
        href={item.href}
      >
        <Icon name={Link2} />
        <span>{item.title}</span>
      </a>
    ),
    folder: (item) => (
      <div className='flex gap-2 defaultBorder cursor-pointer'
        title='Enter folder'
        onClick={() => UserVault.setDir(
          UserVault.currentDir.concat(item.title)
        )}
      >
        <Icon name={item.encryption ? FolderKey : Folder} />
        <span>{item.title}</span>
      </div>
    ),
    encryptedFolder: (item) => (
      <div className='flex gap-2 defaultBorder cursor-pointer'
        title='Enter folder'
        onClick={() => UserVault.setDir(
          UserVault.currentDir.concat(item.title)
        )}
      >
        <Icon name={FolderLock} />
        <span>{item.title}</span>
      </div>
    ),
  }

  function typeSafeRender<T extends ContentTypes>(item: Content<T>) {
    return renderItem[item.type](item);
  }

  return !dir ? <Loading /> : <>
    <Breadcrumbs />
    <hr className='border-1' />
    {dir.type === 'encryptedFolder' ? <form className='flex flex-col gap-2 items-center'
      onSubmit={(e) => {
        e.preventDefault();
        console.log('decrypt folder')
      }}
    >
      <span>This folder is encrypted, enter your password to continue</span>
      <div className='flex gap-2 items-center'>
        <label htmlFor='directoryViewPassword'>Password</label>
        <input className='defaultBorder'
          id='directoryViewPassword'
          type='password'
          required
        />
      </div>
      <button className='bg-fg text-bg rounded-lg p-2'
        type='submit'
      >Decrypt</button>
    </form>
      : !Object.keys(dir.contents).length ? 
        <div className='text-xl font-bold text-gray-500 text-center p-4'>
          No Contents
        </div>
        : Object.values(dir.contents).map(typeSafeRender)
    }
  </>
}

// const renderItem: { [K in ContentTypes]: (item: Content<K>) => Element } = {
//   link: (item) => (
//     <div className='flex justify-between gap-2 defaultBorder bg-fg text-bg'>
//       <a className='flex-1 flex gap-2'
//         title={item.href}
//         href={item.href}
//       >
//         <Icon name={Link2} />
//         <span>{item.title}</span>
//       </a>
//       <Icon name={Settings2} />
//     </div>
//   ),
//   folder: (item) => (
//     <div className='flex justify-between gap-2 defaultBorder'
//       onClick={() => UserVault.setDir(
//         UserVault.currentDir.concat(item.title)
//       )}
//     >
//       <span className='flex-1 flex gap-2 cursor-pointer'
//         title='Enter folder'
//       >
//         <Icon name={Folder} />
//         <span>{item.title}</span>
//       </span>
//       <Icon name={Settings2} />
//     </div>
//   ),
//   encryptedFolder: (item) => (
//     <div>Encrypted Folder: {item.title}</div>
//   ),
// }
