import { Autocomplete } from '@/components/ui';
import { closeModal } from '@/components/modal';
import Breadcrumbs from '@/components/breadcrumbs';
import UserVault from '@/lib/app/userVault';
import getElement from '@/lib/utils/getElement';
import { Content } from '@/types';

// FIX ME extract autocomplete dropdown logic to its own component
// then implement autocomplete component in tagManager

function pathMatch(path1: string[], path2: string[]) {
  return path1.join('/') === path2.join('/');
}

export default function PathManger({ item }: { item: Content }) {
  const path = [ ...UserVault.getViewPath() ];
  const breadcrumbsId = 'pathEditorBreadcrumbs';
  const autocompleteId = 'pathEditorAutocomplete';
  const submitBtnId = 'pathEditorSubmitBtn';

  return (
    <div className='flex flex-col gap-4'>
      <div className='defaultBorder'
        id={breadcrumbsId}
      >
        <Breadcrumbs path={path} />
      </div>
      <Autocomplete id={autocompleteId}
        placeholder='Change path'
        generator={() => {
          const newSegment = getElement<HTMLInputElement>(`#${autocompleteId}`).value;
          const folder = UserVault.get(path, 'folder').throw().data();
          return Object.keys(folder.contents).filter(title => {
            if (folder.contents[title].type !== 'folder') return;
            if (!title.toLowerCase().includes(newSegment.toLowerCase())) return;
            const invalidPath = pathMatch(
              path.concat(title),
              UserVault.path.concat(item.title)
            );
            if (invalidPath) return;
            return true;
          });
        }}
        onSubmit={() => {
          console.log('pathManager submit')
          const pathInput = getElement<HTMLInputElement>(`#${autocompleteId}`);
          path.push(pathInput.value);
          pathInput.value = '';
          getElement(`#${breadcrumbsId}`).replaceChildren(
            <Breadcrumbs path={path} />
          );
          const submitBtn = getElement<HTMLButtonElement>(`#${submitBtnId}`);
          submitBtn.disabled = pathMatch(
            path.concat(item.title),
            UserVault.path.concat(item.title)
          );
          pathInput.focus();
        }}
        onFocus={(e) => {
          if (e.currentTarget.value === '') {
            e.currentTarget.placeholder = 'Backspace to change parent';
          }
        }}
        onBlur={(e) => e.currentTarget.placeholder = 'Change path'}
      />
      <button className='bg-fg text-bg p-2 rounded-lg disabled:opacity-50 disabled:!cursor-not-allowed'
        id={submitBtnId}
        disabled
        type='button'
        onClick={async () => {
          (await UserVault.move(
            UserVault.path.concat(item.title), path
          )).throw();
          closeModal();
        }}
      >Move</button>
    </div>
  )
}

// MAKE SURE TO EXTRACT LOGIC TO PREVENT SCREEN OVERFLOW FROM updatePathAutocomplete()
//
// FIX ME delete if new version works as expected
// const hideAutocomplete = [ 'hidden' ];
// const showAutocomplete = [ 'flex' ];
//
// function updatePathDisplay({ path, item }: { path: string[], item: Content }) {
//   const pathContainer = getElement('#pathDisplay');
//   pathContainer.innerHTML = '';
//   pathContainer.appendChild(<PathDisplay path={path} />);
//   const pathSubmitBtn = getElement<HTMLButtonElement>('#pathSubmitBtn');
//   pathSubmitBtn.disabled = pathMatch(
//     path.concat(item.title),
//     UserVault.path.concat(item.title)
//   );
// }
// 
// // FIX ME replace with breadcrumbs if possible
// function PathDisplay({ path }: { path: string[] }) {
//   setTimeout(() => {
//     const pathContainer = getElement('#pathDisplay');
//     pathContainer.scrollLeft = pathContainer.scrollWidth;
//   });
//   return (
//     <>
//       <div className='flex-shrink-0'>
//         <Icon name={Home} />
//       </div>
//       {path.length > 0 && (
//         <div className='flex-shrink-0'>
//           <Icon name={ChevronRight} />
//         </div>
//       )}
//       {path.map((segment, i) => (
//         <>
//           {i > 0 && (
//             <div className='flex-shrink-0'>
//               <Icon name={ChevronRight} />
//             </div>
//           )}
//           <div className='py-2 text-nowrap'>{segment}</div>
//         </>
//       ))}
//     </>
//   )
// }
// 
// function updatePathAutocomplete(
//   {
//     path,
//     item
//   }: {
//     path: string[],
//     item: Content
//   }
// ) {
//   const pathAutocomplete = getElement<HTMLDivElement>('#pathAutocomplete');
//   pathAutocomplete.innerHTML = '';
//   pathAutocomplete.appendChild(<PathAutocomplete path={path} item={item} />);
// 
//   // FIX ME apply this height limiting stuff to tagManager
//   const pathInputRect = getElement('#pathInput').getBoundingClientRect();
//   const modalContentRect = getElement('#modalContent').getBoundingClientRect();
//   const spaceBelow = modalContentRect.bottom - pathInputRect.bottom;
//   pathAutocomplete.style.maxHeight = `${spaceBelow - 8}px`;
//   // FIX ME do we want autocomplete to ever be on top?
//   // if so it will cover path display
//   // const spaceAbove = pathInputRect.top - modalContentRect.top;
//   // if (spaceAbove > spaceBelow) {
//   //   console.log('render on top')
//   //   pathAutocomplete.classList.remove('top-full');
//   //   pathAutocomplete.classList.add('bottom-full');
//   //   pathAutocomplete.style.maxHeight = `${spaceAbove - 8}px`;
//   // } else {
//   //   console.log('render on bottom')
//   //   pathAutocomplete.classList.remove('bottom-full');
//   //   pathAutocomplete.classList.add('top-full');
//   //   pathAutocomplete.style.maxHeight = `${spaceBelow - 8}px`;
//   // }
// }
// 
// function PathAutocomplete({ path, item }: { path: string[], item: Content }) {
//   const newSegment = getElement<HTMLInputElement>('#pathInput').value;
//   const folder = UserVault.get(path, 'folder').throw().data();
//   const opts = Object.keys(folder.contents).filter(title => {
//     if (folder.contents[title].type !== 'folder') return;
//     if (!title.toLowerCase().includes(newSegment.toLowerCase())) return;
//     const invalidPath = pathMatch(
//       path.concat(title),
//       UserVault.path.concat(item.title)
//     );
//     if (invalidPath) return;
//     return true;
//   });
//   return (
//     <>
//       {!opts.length ? 'No Results' : opts.map((title, i) => (
//         <>
//           {i > 0 && <hr className='border-1' />}
//           <button className='overflow-x-clip overflow-ellipsis'
//             type='button'
//             onClick={() => {
//               path.push(title);
//               updatePathDisplay({ path, item });
//               updatePathAutocomplete({ path, item });
//               const pathInput = getElement<HTMLInputElement>('#pathInput');
//               pathInput.value = '';
//               pathInput.focus();
//             }}
//           >{title}</button>
//         </>
//       ))}
//     </>
//   )
// }
// 
// export function PathManagerOLD({ item }: { item: Content }) {
//   const path = [ ...UserVault.path ];
//   return (
//     <div className='flex flex-col gap-4'>
//       <div className='flex items-center defaultBorder overflow-auto no-scrollbar'
//         id='pathDisplay'
//         onWheel={(e) => {
//           if (e.deltaY !== 0) {
//             e.preventDefault();
//             e.currentTarget.scrollLeft += e.deltaY;
//           }
//         }}
//       >
//         <PathDisplay path={path} />
//       </div>
//       <div className='relative'
//         onBlurCapture={(e) => {
//           const next = e.relatedTarget;
//           if (!(next instanceof Node && e.currentTarget.contains(next))) {
//             const pathAutocomplete = getElement('#pathAutocomplete');
//             pathAutocomplete.classList.add(...hideAutocomplete);
//             pathAutocomplete.classList.remove(...showAutocomplete);
//           }
//         }}
//       >
//         <input className='defaultBorder w-full'
//           id='pathInput'
//           type='text'
//           placeholder='Change path'
//           onFocus={(e) => {
//             e.currentTarget.placeholder = 'Backspace to change parent';
//             const pathAutocomplete = getElement('#pathAutocomplete');
//             pathAutocomplete.classList.add(...showAutocomplete);
//             pathAutocomplete.classList.remove(...hideAutocomplete);
//             updatePathAutocomplete({ path, item });
//           }}
//           onBlur={(e) => {
//             e.currentTarget.placeholder = 'Change path';
//           }}
//           onKeyDown={(e) => {
//             if (e.key === 'Backspace' && e.currentTarget.value === '') {
//               path.splice(path.length - 1, 1);
//               updatePathDisplay({ path, item });
//               updatePathAutocomplete({ path, item });
//             } else if (e.key === 'Escape') {
//               e.currentTarget.blur();
//               e.stopPropagation();
//             } else if (e.key === 'Enter') {
//               const pathAutocomplete = getElement('#pathAutocomplete');
//               const first = pathAutocomplete.firstElementChild;
//               if (first instanceof HTMLButtonElement) first.click();
//             }
//           }}
//           onInput={() => updatePathAutocomplete({ path, item })}
//         />
//         <div className={`absolute flex-col gap-2 bg-bg w-full text-center z-10 my-2 defaultBorder overflow-y-auto ${hideAutocomplete.join(' ')}`}
//           id='pathAutocomplete'
//         >Loading...</div>
//       </div>
//       <button className='bg-fg text-bg p-2 rounded-lg disabled:opacity-50 disabled:!cursor-not-allowed'
//         id='pathSubmitBtn'
//         disabled
//         type='button'
//         onClick={async () => {
//           (await UserVault.move(
//             UserVault.path.concat(item.title), path
//           )).throw();
//           closeModal();
//         }}
//       >Move</button>
//     </div>
//   )
// }
