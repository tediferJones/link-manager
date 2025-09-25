import Breadcrumbs from '@/components/breadcrumbs';
import Loading from '@/components/loading';
import DecryptPrompt from '@/components/decryptPrompt';
import RenderItem from '@/components/renderItem';
import ErrorMsg, { hideError, showError } from '@/components/errorMsg';
import UserVault from '@/lib/userVault';

export default function DirectoryView() {
  const dir = UserVault.getCurrentDir();
  const errorId = 'moveError';

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
    {UserVault.toMove && (
      <>
        <div className='flex gap-2'>
          <div className='flex-1'>
            <RenderItem item={UserVault.toMove.item} moveItem />
          </div>
          <button className='p-2 rounded-lg bg-fg text-bg'
            onClick={() => {
              hideError(errorId);
              const result = UserVault.endMove();
              if (!result.success) showError(errorId, result.error);
            }}
          >Move Here</button>
          <button className='p-2 rounded-lg bg-fg text-bg'
            onClick={() => UserVault.cancelMove()}
          >Cancel</button>
        </div>
        <ErrorMsg id={errorId} />
        <hr className='border-1' />
      </>
    )}
    <div className='flex-1 flex flex-col gap-2 overflow-y-auto'
      id='directoryViewItems'
    >
      {dir.type === 'encryptedFolder' ? <DecryptPrompt /> : 
        !Object.keys(dir.contents).length ? 
        <div className='text-xl font-bold text-muted text-center m-auto'>
          No Contents
        </div>
        : [
            ...dir.sortedKeys.pinned,
            ...dir.sortedKeys.folders,
            ...dir.sortedKeys.links,
            ...dir.sortedKeys.watched,
          ].map(title => <RenderItem item={dir.contents[title]} />)
      }
    </div>
  </>
}
