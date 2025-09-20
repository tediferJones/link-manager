import getElement from '@/lib/getElement';
import UserVault from '@/lib/userVault'
import { Content } from '@/types';

// FIX ME
// if we stick with this, make sure titles cannot container the '/' char
// autocomplete should be able to flow outside of modal without triggering scrollbar
// autocomplete should not cause modal to resize
//  - maybe give modal a fixed size
// when item from autocomplete is selected: 
//  - replace last path segment with title 
//  - reset autocomplete container
// pressing escape should lose focus on input, not close the whole modal
// get button toggle working
//  - only enable move button if:
//    - new dir exists 
//    - new dir does not contain an item with the same title
//    - new dir is not current dir
//  - if path contains an item with same title button should read something like "Title already taken"

const showAutoComplete = [ 'flex' ];
const hideAutoComplete = [ 'hidden' ];

export default function PathManager({ item }: { item: Content }) {
  let path = [ ...UserVault.currentDir ];
  
  return (
    <form className='grid grid-cols-3 gap-4'
      onSubmit={(e) => {
        e.preventDefault();
        UserVault.move(item.title, path);
      }}
    >
      <label className='m-auto'
        htmlFor='pathManager'
      >Path</label>
      <div className='relative col-span-2'
        onFocusCapture={() => {
          const container = getElement('#pathManagerAutoComplete');
          container.classList.add(...showAutoComplete);
          container.classList.remove(...hideAutoComplete);
        }}
        onBlurCapture={(e) => {
          const next = e.relatedTarget;
          if (!(next instanceof Node && e.currentTarget.contains(next))) {
            const container = getElement('#pathManagerAutoComplete');
            container.classList.add(...hideAutoComplete);
            container.classList.remove(...showAutoComplete);
          }
        }}
      >
        <input className='defaultBorder'
          id='pathManager'
          value={`/${path.join('/')}`}
          onInput={(e) => {
            const val = e.currentTarget.value;
            if (!val) e.currentTarget.value = '/';
            try {
              path = val.split('/').slice(1);
              console.log('PATH', path)
              const folder = UserVault.getCurrentDir(path.slice(0, -1), 'preserve');
              if (!folder) throw Error('dir is null');
              if (folder.type === 'encryptedFolder') {
                throw Error('dir is encrypted');
              }
              const opts = Object.keys(folder.contents).filter(title => {
                if (folder.contents[title].type !== 'folder') return;
                if (!title.toLowerCase().includes(path[path.length - 1])) return;
                return true;
              });
              const autoCompleteContainer = getElement('#pathManagerAutoComplete');
              autoCompleteContainer.innerHTML = '';
              autoCompleteContainer.append(
                !opts.length ? 'No Results' : 
                <>
                  {opts.map((title, i) => (
                      <>
                        {i !== 0 && <hr className='border-1' />}
                        <button type='button'
                          onClick={() => console.log('replace last path segment with', title)}
                        >{title}</button>
                      </>
                  ))}
                </>
              );
            } catch {
              const autoCompleteContainer = getElement('#pathManagerAutoComplete');
              autoCompleteContainer.innerHTML = 'Error';
            }
          }}
        />
        <div className={`absolute z-10 defaultBorder bg-bg w-full mt-2 text-center flex-col gap-2 ${hideAutoComplete.join(' ')}`}
          id='pathManagerAutoComplete'
        >No Results</div>
      </div>
      <button className='col-span-full p-2 bg-fg text-bg rounded-lg opacity-50 !cursor-not-allowed'
        disabled={true}
      >Move</button>
    </form>
  )
}

// import { closeModal } from '@/components/modal';
// import UserVault from '@/lib/userVault';
// import getElement from '@/lib/getElement';
// import { Content } from '@/types';
// 
// // FIX ME move to it's own file
// // FIX ME delete this whole file if not used
// class Ref<T> {
//   current: T;
// 
//   constructor(arg: T) {
//     this.current = arg;
//   }
// 
//   get() {
//     return this.current
//   }
// 
//   set(arg: T) {
//     this.current = arg
//   }
// }
// 
// function refreshPath(pathRef: Ref<string[]>) {
//   const pathContainer = getElement('#pathManagerContainer');
//   pathContainer.innerHTML = '';
//   pathContainer.appendChild(<PathDisplay pathRef={pathRef} />);
// }
// 
// // FIX ME make sure you can't move folders into their own path
// // i.e. cant move /folder1/nestedFolder1 into /folder1/nestedFolder1/nestedFolder2
// function PathDisplay(
//   {
//     pathRef,
//     index = 0,
//   }: {
//     pathRef: Ref<string[]>,
//     index?: number,
//   }
// ) {
//   const path = pathRef.current;
//   if (index > path.length) return;
//   const slicedPath = path.slice(0, index);
//   const segmentDir = UserVault.getCurrentDir(slicedPath, 'preserve');
//   if (!segmentDir) throw Error('segment dir is null');
//   if (segmentDir.type === 'encryptedFolder') {
//     throw Error('segment dir is encrypted');
//   }
//   const availableDirs = Object.values(segmentDir.contents).filter(
//     item => item.type === 'folder'
//   );
//   return (
//     <div className='flex flex-col gap-2'>
//       {availableDirs.map(folder => (
//         <div className='flex flex-col gap-2'>
//           <div className={`py-1 px-2 rounded-lg ${folder.title === path[index] ? 'bg-fg text-bg' : ''}`}
//             onClick={() => {
//               console.log('setting path', slicedPath.concat(folder.title))
//               pathRef.set(slicedPath.concat(folder.title));
//               refreshPath(pathRef);
//             }}
//           >{folder.title}</div>
//           {folder.title === path[index] && (
//             <div className='pl-2'>
//               <PathDisplay pathRef={pathRef}
//                 index={index + 1}
//               />
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   )
// }
// 
// // FIX ME, path display should just be another DirectoryView
// export default function PathManager({ item }: { item: Content }) {
//   const pathRef = new Ref([ ...UserVault.currentDir ]);
//   return (
//     <form className='flex flex-col gap-4' onSubmit={(e) => {
//       e.preventDefault();
//       console.log(pathRef.get(), item)
//       // UserVault.moveItem(item.title, pathRef.get());
//       closeModal();
//     }}>
//       <label className='m-auto'
//         htmlFor='pathManagerContainer'
//       >Location</label>
//       <div className='defaultBorder col-span-2'
//         id='pathManagerContainer'
//       >
//         <PathDisplay pathRef={pathRef} />
//       </div>
//       <button className='w-full bg-fg text-bg p-2 rounded-lg'
//         type='submit'
//       >Move</button>
//     </form>
//   )
// }
