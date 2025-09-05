import UserVault from '@/lib/userVault';
import Icon from './icon';
import { ChevronRight, Home } from 'lucide';

export default function Breadcrumbs() {
  return (
    // FIX ME this should scroll side to side without a scroll bar
    // would be nice to add an ellipse to whichever side is overflowing
    // also maybe change '~' to a little house icon to indicate home
    // and maybe change '/' to little chevrons
    <div className='flex gap-2 overflow-hidden font-semibold'>
      <button onClick={() => UserVault.setDir([])}>
        <Icon name={Home} />
      </button>
      <span className='flex-shrink-0'>
        <Icon name={ChevronRight} />
      </span>
      {UserVault.currentDir.map((key, i, arr) => (
        <>
          <button className='underline text-primary'
            onClick={() => UserVault.setDir(arr.slice(0, i + 1))}
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

// <div className='flex gap-2 overflow-hidden font-semibold'>
//   {[ '~', ...UserVault.currentDir ].map((key, i, arr) => (
//     <>
//       <span className='underline cursor-pointer text-primary'
//         onClick={() => UserVault.setDir(arr.slice(1, i + 1))}
//       >{key}</span>
//       <span>/</span>
//     </>
//   ))}
// </div>
