import { ChevronDown, ChevronUp, Eye, Folder, FolderKey, FolderLock, Link2, Lock, Settings2 } from 'lucide';
import Breadcrumbs from '@/components/breadcrumbs';
import Icon from '@/components/icon';
import Loading from '@/components/loading';
import DecryptPrompt from '@/components/decryptPrompt';
import ItemSettings from '@/components/itemSettings';
import { openModal } from '@/components/modal';
import UserVault from '@/lib/userVault';
import { AnyContent, Content, ContentTypes, RenderItem } from '@/types';

// function getNewPriority(element: Element | null, type: 'up' | 'down') {
//   const getElement = {
//     up: (e: Element) => e.previousElementSibling,
//     down: (e: Element) => e.nextElementSibling,
//   }
// 
//   if (!element) return console.log('parent is null');
//   const first = getElement[type](element);
//   console.log('first', first)
//   const firstPriority = getPriority(first);
//   if (!first || !firstPriority) return console.log(`No ${type} element found`);
//   const second = getElement[type](first);
//   const secondPriority = getPriority(second);
//   if (!second || !secondPriority) {
//     // plus or minus 1 depending on type
//     console.log('diff 1')
//     return type === 'up' ? firstPriority + 1 : firstPriority - 1;
//   }
//   // console.log(firstPriority, secondPriority)
//   // const mid = (firstPriority - secondPriority) + secondPriority;
//   // if (mid === firstPriority || mid === secondPriority) throw Error('priority match')
//   // return mid;
//   console.log('average')
//   // FIX ME average does not provide enough precision
//   // find some better way to organize these without using decimals
//   // also make sure that new priority does not match either firstPriority or secondPriority
//   return (firstPriority + secondPriority) / 2;
// }
// 
// function getPriority(element: Element | null) {
//   if (!element) return;
//   const priority = element.getAttribute('data-priority');
//   if (!priority) return;
//   return Number(priority);
// }

export default function DirectoryView() {
  const dir = UserVault.getCurrentDir();

  // FIX ME separate into individual components
  // or just one big meta component
  const renderItem: RenderItem = {
    link: (item) => (
      // would be nice if toggling link watched was animated
      <div className={`flex gap-4 defaultBorder ${item.watched ? 'bg-secondary text-fg' : 'bg-fg text-bg'}`}
        id={UserVault.currentDir.concat(item.title).join(',')}
        data-priority={item.watched ? undefined : item.priority}
      >
        <a className='flex-1 flex gap-2 overflow-hidden'
          title={`Go to: ${item.href}`}
          href={item.href}
        >
          <div className='flex-shrink-0'>
            <Icon name={Link2} />
          </div>
          <span className='truncate'>{item.title}</span>
        </a>
        {!item.watched && (
          <>
            <button onClick={() => {
              UserVault.setPriority(item.title, 'up');
              // const newPriority = getNewPriority(
              //   e.currentTarget.parentElement,
              //   'up',
              // );
              // if (newPriority) {
              //   UserVault.setPriority(item.title, newPriority);
              // }
            }}>
              <Icon name={ChevronUp} />
            </button>
            <button onClick={() => {
              UserVault.setPriority(item.title, 'down')
              // const newPriority = getNewPriority(
              //   e.currentTarget.parentElement,
              //   'down',
              // )
              // if (newPriority) {
              //   UserVault.setPriority(item.title, newPriority);
              // }
            }}>
              <Icon name={ChevronDown} />
            </button>
          </>
        )}
        <button className={`transition-all duration-300 ${item.watched ? 'opacity-100' : 'opacity-50'}`}
          onClick={() => UserVault.toggleWatched(item.title)}
        >
          <Icon name={Eye} />
        </button>
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

  function isWatchedLink(
    item: Content<'link'>
  ): item is Required<Content<'link'>> {
    return !!item.watched
  }

  function sortItems(items: AnyContent[]) {
    const { folders, links, watched } = items.reduce((obj, item) => {
      if (item.type === 'folder' || item.type === 'encryptedFolder') {
        obj.folders.push(item);
      } else if (isWatchedLink(item)) {
        obj.watched.push(item);
      } else {
        obj.links.push(item);
      }
      return obj;
    }, {
        folders: [] as Content<'folder' | 'encryptedFolder'>[],
        links: [] as Content<'link'>[],
        watched: [] as Required<Content<'link'>>[],
      }
    );

    // Sort folders alphabetically at the top
    // then links that havent been watched by priority
    // then links that have been watched in order from most recently watched to least recently watched
    return [
      ...folders.sort((a, b) => a.title.localeCompare(b.title)),
      ...links.sort((a, b) => b.priority - a.priority),
      ...watched.sort((a, b) => b.watched - a.watched),
    ];
  }

  return !dir ? <Loading /> : <>
    <Breadcrumbs />
    <hr className='border-1' />
    <div className='flex-1 flex flex-col gap-2 overflow-y-auto'
      id='directoryViewItems'
    >
      {dir.type === 'encryptedFolder' ? <DecryptPrompt /> : 
        !Object.keys(dir.contents).length ? 
        <div className='text-xl font-bold text-muted text-center m-auto'>
          No Contents
        </div>
        : sortItems(Object.values(dir.contents)).map(typeSafeRender)
      }
    </div>
  </>
}
