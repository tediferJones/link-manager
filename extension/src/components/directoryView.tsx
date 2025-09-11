import { Folder, FolderKey, FolderLock, Link2, Lock, Settings2 } from 'lucide';
import Breadcrumbs from '@/components/breadcrumbs';
import Icon from '@/components/icon';
import Loading from '@/components/loading';
import DecryptPrompt from '@/components/decryptPrompt';
import ItemSettings from '@/components/itemSettings';
import { openModal } from '@/components/modal';
import UserVault from '@/lib/userVault';
import { Content, ContentTypes, RenderItem } from '@/types';

export default function DirectoryView() {
  const dir = UserVault.getCurrentDir();

  // FIX ME seperate into individual components
  // or just one big meta component
  const renderItem: RenderItem = {
    link: (item) => (
      <div className='flex gap-4 defaultBorder bg-fg text-bg'>
        <a className='flex-1 flex gap-2 overflow-hidden'
          title={`Go to: ${item.href}`}
          href={item.href}
        >
          <div className='flex-shrink-0'>
            <Icon name={Link2} />
          </div>
          <span className='truncate'>{item.title}</span>
        </a>
        <button onClick={() => {
          openModal(
            'LinkSettings',
            <ItemSettings item={item} />
          )
        }}>
          <Icon name={Settings2} />
        </button>
      </div>
    ),
    folder: (item) => (
      <div className='flex gap-4 defaultBorder'>
        <button className='flex-1 flex gap-2 cursor-pointer overflow-hidden'
          title={`Enter folder: ${item.title}`}
          onClick={() => UserVault.setDir(
            UserVault.currentDir.concat(item.title)
          )}
        >
          <div className='flex-shrink-0'>
            <Icon name={item.encryption ? FolderKey : Folder} />
          </div>
          <span className='truncate'>{item.title}</span>
        </button>
        {item.encryption && <button onClick={() => {
          UserVault.recryptFolder(item.title)
        }}>
          <Icon name={Lock} />
        </button>}
        <button onClick={() => {
          openModal(
            'Folder Settings',
            <ItemSettings item={item} />
          )
        }}>
          <Icon name={Settings2} />
        </button>
      </div>
    ),
    encryptedFolder: (item) => (
      <div className='flex gap-4 defaultBorder'>
        <button className='flex-1 flex gap-2 cursor-pointer overflow-hidden'
          title={`Enter encrypted folder: ${item.title}`}
          onClick={() => UserVault.setDir(
            UserVault.currentDir.concat(item.title)
          )}
        >
          <div className='flex-shrink-0'>
            <Icon name={FolderLock} />
          </div>
          <span className='truncate'>{item.title}</span>
        </button>
        <button onClick={() => {
          openModal(
            'Encrypted Folder Settings',
            <ItemSettings item={item} />
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
  // FIX ME, could we use transition-all to animate the padding change?
  setTimeout(() => {
    const container = document.querySelector('#directoryViewItems');
    if (container && container.scrollHeight > container.clientHeight) {
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
        <div className='text-xl font-bold text-slate-500 text-center m-auto'>
          No Contents
        </div>
        : Object.values(dir.contents).map(typeSafeRender)
      }
    </div>
  </>
}
