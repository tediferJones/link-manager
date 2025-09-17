import { ChevronRight, Home } from 'lucide';
import Icon from '@/components/icon';
import UserVault from '@/lib/userVault';

export default function Breadcrumbs() {
  return (
    // FIX ME would be nice to add an ellipse to whichever side is overflowing
    <div className='flex-shrink-0 flex gap-2 overflow-auto font-semibold no-scrollbar'
      id='breadcrumbs'
      onWheel={(e) => {
        if (e.deltaY !== 0) {
          e.preventDefault();
          e.currentTarget.scrollLeft += e.deltaY;
        }
      }}
    >
      <button onClick={() => UserVault.setDir([])}
        title='Go to: Home'
      >
        <Icon name={Home} />
      </button>
      <span className='flex-shrink-0'>
        <Icon name={ChevronRight} />
      </span>
      {UserVault.currentDir.map((key, i, arr) => (
        <>
          <button className='underline text-primary'
            onClick={() => UserVault.setDir(arr.slice(0, i + 1))}
            title={`Go to: ${key}`}
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
