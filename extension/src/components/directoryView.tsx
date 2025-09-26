import Breadcrumbs from '@/components/breadcrumbs';
import DecryptPrompt from '@/components/decryptPrompt';
import RenderItem from '@/components/renderItem';
import { Content } from '@/types';

export default function DirectoryView({ item }: { item: Content<'folder' | 'encryptedFolder'> }) {
  // add scrollbar padding only if container is scrollable
  // FIX ME, could we use transition-all to animate the padding change?
  setTimeout(() => {
    const container = document.querySelector('#directoryViewItems');
    if (container && container.scrollHeight > container.clientHeight) {
      container.classList.add('pr-2');
    }
  });

  return (
    <>
      <Breadcrumbs />
      <hr className='border-1' />
      <div className='flex-1 flex flex-col gap-2 overflow-y-auto'
        id='directoryViewItems'
      >
        {item.type === 'encryptedFolder' ? <DecryptPrompt /> : 
          !Object.keys(item.contents).length ? 
            <div className='text-xl font-bold text-muted text-center m-auto'>
              No Contents
            </div>
            : [
              ...item.sortedKeys.pinned,
              ...item.sortedKeys.folder,
              ...item.sortedKeys.link,
              ...item.sortedKeys.watched,
            ].map(title => <RenderItem item={item.contents[title]} />)
        }
      </div>
    </>
  )
}
