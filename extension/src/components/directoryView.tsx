import { Folder, FolderKey, FolderLock, Link2, Settings2 } from 'lucide';
import UserVault from '@/lib/userVault';
import Breadcrumbs from '@/components/breadcrumbs';
import Icon from '@/components/icon';
import Loading from '@/components/loading';
import FolderSettings from '@/components/folderSettings';
import { openModal } from '@/components/modal';
import getElement from '@/lib/getElement';
import { Content, ContentTypes } from '@/types';

export default function DirectoryView() {
  const dir = UserVault.getCurrentDir();

  // FIX ME seperate into individual components
  const renderItem: { [K in ContentTypes]: (item: Content<K>) => Element } = {
    link: (item) => (
      <div className='flex gap-4 defaultBorder bg-fg text-bg'>
        <a className='flex-1 flex gap-2'
          title={item.href}
          href={item.href}
        >
          <Icon name={Link2} />
          <span>{item.title}</span>
        </a>
        <button onClick={() => {
          openModal(
            'LinkSettings',
            <div>Link Settings Go Here</div>
          )
        }}>
          <Icon name={Settings2} />
        </button>
      </div>
    ),
    folder: (item) => (
      <div className='flex gap-4 defaultBorder'>
        <div className='flex-1 flex gap-2 cursor-pointer'
          title='Enter folder'
          onClick={() => UserVault.setDir(
            UserVault.currentDir.concat(item.title)
          )}
        >
          <Icon name={item.encryption ? FolderKey : Folder} />
          <span>{item.title}</span>
        </div>
        <button onClick={() => {
          openModal(
            'Folder Settings',
            <FolderSettings folder={item} />
          )
        }}>
          <Icon name={Settings2} />
        </button>
      </div>
    ),
    encryptedFolder: (item) => (
      <div className='flex gap-4 defaultBorder'>
        <div className='flex-1 flex gap-2 cursor-pointer'
          title='Enter folder'
          onClick={() => UserVault.setDir(
            UserVault.currentDir.concat(item.title)
          )}
        >
          <Icon name={FolderLock} />
          <span>{item.title}</span>
        </div>
        <button onClick={() => {
          openModal(
            'Encrypted Folder Settings',
            <div>Encrypted Folder Settings Go Here</div>
          )
        }}>
          <Icon name={Settings2} />
        </button>
      </div>
    ),
  }

  function typeSafeRender<T extends ContentTypes>(item: Content<T>) {
    return renderItem[item.type](item);
  }

  return !dir ? <Loading /> : <>
    <Breadcrumbs />
    <hr className='border-1' />
    {dir.type === 'encryptedFolder' ? <form className='flex flex-col gap-2 items-center defaultBorder w-min m-auto my-8'
      onSubmit={(e) => {
        e.preventDefault();
        console.log('decrypt folder')
        const password = getElement<HTMLInputElement>(
          '#directoryViewPassword'
        ).value;
        // FIX ME wrap this in try catch, if error then password is incorrect
        UserVault.decryptFolder(password);
      }}
    >
      <span className='text-center'>
        This folder is encrypted, enter your password to continue
      </span>
      <div className='flex gap-2 items-center'>
        <label htmlFor='directoryViewPassword'>Password</label>
        <input className='defaultBorder'
          id='directoryViewPassword'
          type='password'
          required
        />
      </div>
      <button className='bg-fg text-bg rounded-lg p-2 w-full'
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
