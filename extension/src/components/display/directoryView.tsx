import { Breadcrumbs, ListItem } from '@/components/display';
import { DecryptPrompt } from '@/components/forms';
import UserVault from '@/lib/app/userVault';
import getElement from '@/lib/utils/getElement';
import { Content } from '@/types';

// FIX ME move to constants
export const directoryViewId = 'directoryViewItems';
export const noContentText = 'No Contents';
export const paddingClass = 'pr-2';

// FIX ME maybe just rename to Directory
//  - that fact that it's in the display folder implies it is a view
export default function DirectoryView(
  {
    item,
  }: {
    item: Content<'folder' | 'encryptedFolder'>,
  }
) {
  // FIX ME, could we use transition-all to animate the padding change?
  // add scrollbar padding only if container is scrollable
  setTimeout(() => {
    const container = getElement(`#${directoryViewId}`);
    if (container && container.scrollHeight > container.clientHeight) {
      container.classList.add(paddingClass);
    }
  });

  const viewPath = UserVault.getViewPath();

  return (
    <>
      <Breadcrumbs path={viewPath} navigate />
      <hr className='border-1' />
      <div className='flex-1 flex flex-col gap-2 overflow-y-auto'
        id={directoryViewId}
      >
        {item.type === 'encryptedFolder' ? <DecryptPrompt path={viewPath} /> :
          !Object.keys(item.contents).length ? 
            <div className='text-xl font-bold text-muted text-center m-auto'>
              {noContentText}
            </div>
            : [
              ...item.sortedKeys.pinned,
              ...item.sortedKeys.folder,
              ...item.sortedKeys.link,
              ...item.sortedKeys.watched,
            ].map(title => <ListItem item={item.contents[title]} />)
        }
      </div>
    </>
  )
}
