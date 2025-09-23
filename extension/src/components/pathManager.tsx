import { ChevronRight, Home } from 'lucide';
import Icon from '@/components/icon';
import { closeModal } from '@/components/modal';
import UserVault from '@/lib/userVault';
import getElement from '@/lib/getElement';
import { Content } from '@/types';

// FIX ME test autocomplete when there are lots of options
// container should not overflow screen
// container should also be above/below depending on which direction has more space
// if container requires more space than screen can allow, have container scroll
// maybe just have a max number of items before scrolling
//  i.e. container should only be tall enough to fit 5 items
//    - the rest can be accessible via scrolling
//
// maybe make a portal component, all the above will also apply to tag autocomplete

function pathMatch(path1: string[], path2: string[]) {
  return path1.join('/') === path2.join('/');
}

function updatePathDisplay({ path, item }: { path: string[], item: Content }) {
  const pathContainer = getElement('#pathContainer');
  pathContainer.innerHTML = '';
  pathContainer.appendChild(<PathDisplay path={path} />);
  const pathSubmitBtn = getElement<HTMLButtonElement>('#pathSubmitBtn');
  pathSubmitBtn.disabled = pathMatch(
    path.concat(item.title),
    UserVault.currentDir.concat(item.title)
  );
}

function PathDisplay({ path }: { path: string[] }) {
  setTimeout(() => {
    const pathContainer = getElement('#pathContainer');
    pathContainer.scrollLeft = pathContainer.scrollWidth;
  });
  return (
    <>
      <div className='flex-shrink-0'>
        <Icon name={Home} />
      </div>
      {path.length > 0 && (
        <div className='flex-shrink-0'>
          <Icon name={ChevronRight} />
        </div>
      )}
      {path.map((segment, i) => (
        <>
          {i > 0 && (
            <div className='flex-shrink-0'>
              <Icon name={ChevronRight} />
            </div>
          )}
          <div className='py-2 text-nowrap'>{segment}</div>
        </>
      ))}
    </>
  )
}

function PathInput({ path, item }: { path: string[], item: Content }) {
  setTimeout(() => updatePathAutocomplete({ path, item }));
  return (
    <div className='flex items-center' id='pathInputContainer'>
      <Icon name={ChevronRight} />
      <div className='relative'
        onBlurCapture={(e) => {
          const next = e.relatedTarget;
          if (!(next instanceof Node && e.currentTarget.contains(next))) {
            // FIX ME find some way to remove scroll event listener in here
            getElement('#pathInputContainer').remove();
          }
        }}
      >
        <input className='defaultBorder'
          id='pathInput' 
          placeholder='Backspace to change parent'
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && e.currentTarget.value === '') {
              path.splice(path.length - 1, 1);
              updatePathDisplay({ path, item });
              getElement<HTMLFormElement>('#pathContainer').click();
            } else if (e.key === 'Escape') {
              e.currentTarget.blur();
              e.stopPropagation();
            }
          }}
          onInput={() => updatePathAutocomplete({ path, item })}
        />
        <div className='fixed my-1 defaultBorder bg-bg z-10 flex flex-col gap-2 text-center overflow-y-auto'
          id='pathAutocomplete'
          onWheel={(e) => e.stopPropagation()}
        ></div>
      </div>
    </div>
  )
}

function updatePathAutocomplete(
  {
    path,
    item
  }: {
    path: string[],
    item: Content
  }
) {
  const pathAutocomplete = getElement<HTMLDivElement>('#pathAutocomplete');
  pathAutocomplete.innerHTML = '';
  pathAutocomplete.appendChild(<PathAutocomplete path={path} item={item} />);
  const pathInput = getElement<HTMLInputElement>('#pathInput');
  const pathInputRect = pathInput.getBoundingClientRect();
  const mid = (pathInputRect.top + pathInputRect.bottom) / 2;
  pathAutocomplete.style.width = `${pathInputRect.width}px`;
  pathAutocomplete.style.left = `${pathInputRect.left}px`;
  // FIX ME portalling issues
  // funky placement of autocomplete box on smaller windows
  // try half height of monitor to see
  if (Math.abs(mid - window.innerHeight) < mid) {
    console.log('goes on top')
    pathAutocomplete.style.top = `${pathInputRect.top + window.scrollY - pathAutocomplete.offsetHeight - 8}px`
    pathAutocomplete.style.maxHeight = `${pathInputRect.top - 8}px`;
  } else {
    console.log('goes on bottom')
    pathAutocomplete.style.top = `${pathInputRect.bottom}px`;
    pathAutocomplete.style.maxHeight = `${window.innerHeight - pathInputRect.bottom - 8}px`;
  }
  // const { top, maxHeight } = getPortalBounds(pathInputRect, pathAutocomplete.offsetHeight);
  // pathAutocomplete.style.top = `${top}px`
  // pathAutocomplete.style.maxHeight = `${maxHeight}px`;
}

// function getPortalBounds(rect: DOMRect, dropdownHeight: number) {
//   const viewportHeight = window.innerHeight;
//   const spaceBelow = viewportHeight - rect.bottom;
//   const spaceAbove = rect.top;
// 
//   if (spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove) {
//     return {
//       top: rect.bottom + window.scrollY,
//       maxHeight: spaceBelow,
//     }
//   } else {
//     return {
//       top: rect.top + window.scrollY - dropdownHeight,
//       maxHeight: spaceAbove,
//     }
//   }
// }

function PathAutocomplete({ path, item }: { path: string[], item: Content }) {
  const newSegment = getElement<HTMLInputElement>('#pathInput').value;
  const folder = UserVault.getCurrentDir(path, 'preserve');
  if (!folder) throw Error('dir is null');
  if (folder.type === 'encryptedFolder') throw Error('dir is encrypted');
  const opts = Object.keys(folder.contents).filter(title => {
    if (folder.contents[title].type !== 'folder') return;
    if (!title.toLowerCase().includes(newSegment.toLowerCase())) return;
    const invalidPath = pathMatch(
      path.concat(title),
      UserVault.currentDir.concat(item.title)
    );
    if (invalidPath) return;
    return true;
  });
  return (
    <>
      {!opts.length ? 'No Results' : opts.map((title, i) => (
        <>
          {i > 0 && <hr className='border-1' />}
          <button className='overflow-ellipsis overflow-x-clip'
            type='button'
            onClick={() => {
              path.push(title);
              updatePathDisplay({ path, item });
            }}
          >{title}</button>
        </>
      ))}
    </>
  )
}


export default function PathManager({ item }: { item: Content }) {
  const path = [ ...UserVault.currentDir ];

  function handleScroll() {
    updatePathAutocomplete({ path, item });
  }

  return (
    <div className='flex flex-col gap-4'>
      <button className='defaultBorder flex items-center overflow-auto no-scrollbar'
        id='pathContainer'
        onClick={(e) => {
          if (document.querySelector('#pathInput')) return;
          e.currentTarget.appendChild(<PathInput path={path} item={item} />);
          getElement<HTMLInputElement>('#pathInput').focus();
          getElement('#modalContent').addEventListener('scroll', handleScroll);
        }}
        onWheel={(e) => {
          if (e.deltaY !== 0) {
            e.preventDefault();
            e.currentTarget.scrollLeft += e.deltaY;
          }
        }}
      >
        <PathDisplay path={path} />
      </button>
      <button className='bg-fg text-bg p-2 rounded-lg disabled:opacity-50 disabled:!cursor-not-allowed'
        id='pathSubmitBtn'
        disabled={true}
        onClick={() => {
          console.log('attempting submit')
          const pathSubmitBtn = getElement<HTMLButtonElement>('#pathSubmitBtn');
          if (pathSubmitBtn.disabled) return;
          console.log('submitting')
          console.log('move', item.title, 'to', path)
          UserVault.move(item.title, path);
          closeModal();
        }}
      >Move</button>
    </div>
  )
}
