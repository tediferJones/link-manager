import { Folder, FolderKey, FolderLock, Link2, Settings2 } from 'lucide';
import Breadcrumbs from '@/components/breadcrumbs';
import Icon from '@/components/icon';
import Loading from '@/components/loading';
import FolderSettings from '@/components/folderSettings';
import DecryptPrompt from '@/components/decryptPrompt';
import { openModal } from '@/components/modal';
import UserVault from '@/lib/userVault';
import getElement from '@/lib/getElement';
import { Content, ContentTypes, RenderItem } from '@/types';

export default function DirectoryView() {
  const dir = UserVault.getCurrentDir();

  // FIX ME seperate into individual components
  const renderItem: RenderItem = {
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

  // add scrollbar padding only if container is scrollable
  setTimeout(() => {
    const container = getElement('#directoryViewItems');
    if (container.scrollHeight > container.clientHeight) {
      container.classList.add('pr-2');
    }
  });

  return !dir ? <Loading /> : <>
    <Breadcrumbs />
    <hr className='border-1' />
    <div className='flex-1 flex flex-col gap-2 overflow-y-auto'
      id='directoryViewItems'
    >
      {dir.type === 'encryptedFolder' ? <DecryptPrompt /> : 
        !Object.keys(dir.contents).length ? 
        <div className='text-xl font-bold text-gray-500 text-center m-auto'>
          No Contents
        </div>
        : Object.values(dir.contents).map(typeSafeRender)
      }
    </div>
  </>
}
