import { ChevronRight, Home } from 'lucide';
import { Icon } from '@/components/ui';
import UserVault from '@/lib/app/userVault';

export default function Breadcrumbs(
  {
    path,
    navigate
  }: {
    path: string[],
    navigate?: boolean
  }
) {
  return (
    // FIX ME would be nice to add an ellipse to whichever side is overflowing
    // also display is incorrect when loading nested encrypted folders
    // if currentDir is [ 'encFolder1', 'encFolder2' ]
    // breadcrumbs will display full path when attempting to decrypt 'encFolder1'
    <div className='flex-shrink-0 flex gap-2 overflow-auto font-semibold no-scrollbar'
      id='breadcrumbs'
      onWheel={(e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          e.currentTarget.scrollLeft += e.deltaY;
        }
      }}
    >
      <button onClick={() => navigate && UserVault.setDir([])}
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
            onClick={() => navigate && UserVault.setDir(arr.slice(0, i + 1))}
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
