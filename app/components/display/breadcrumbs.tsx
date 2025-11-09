import { ChevronRight, Home } from 'lucide';
import { Icon } from '@/components/ui';
import { setPath } from '@/lib/newVault/sync';
import getElement from '@/lib/utils/getElement';

// FIX ME maybe rename to PathDisplay or just Path
//  - it's in the display folder so the fact that it's a path is implied

export default function Breadcrumbs(
  {
    path,
    navigate
  }: {
    path: string[],
    navigate?: boolean
  }
) {
  setTimeout(() => {
    const breadcrumbs = getElement('#breadcrumbs');
    breadcrumbs.scrollLeft = breadcrumbs.scrollWidth;
  });

  return (
    // FIX ME would be nice to add an ellipse to whichever side is overflowing
    // also display is incorrect when loading nested encrypted folders
    // if currentDir is [ 'encFolder1', 'encFolder2' ]
    // breadcrumbs will display full path when attempting to decrypt 'encFolder1'
    <div className='flex-shrink-0 flex gap-2 overflow-auto font-semibold no-scrollbar'
      // FIX ME this id will get duplicated between directoryView and PathEditor
      id='breadcrumbs'
      onWheel={(e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          e.currentTarget.scrollLeft += e.deltaY;
        }
      }}
    >
      <button onClick={() => navigate && setPath([])}
        title={navigate ? 'Go to: Home' : undefined}
      >
        <Icon name={Home} />
      </button>
      <span className='flex-shrink-0'>
        <Icon name={ChevronRight} />
      </span>
      {path.map((key, i, arr) => (
        <>
          <button className={navigate ? 'underline' : ''}
            onClick={() => navigate && setPath(arr.slice(0, i + 1))}
            title={navigate ? `Go to: ${key}` : undefined}
          >{key}</button>
          {i < arr.length - 1 && 
            <div className='flex-shrink-0'>
              <Icon name={ChevronRight} />
            </div>
          }
        </>
      ))}
    </div>
  )
}
