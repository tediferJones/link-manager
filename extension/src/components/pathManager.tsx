import { closeModal } from '@/components/modal';
import UserVault from '@/lib/userVault';
import getElement from '@/lib/getElement';
import { Content } from '@/types';

// FIX ME move to it's own file
// FIX ME delete this whole file if not used
class Ref<T> {
  current: T;

  constructor(arg: T) {
    this.current = arg;
  }

  get() {
    return this.current
  }

  set(arg: T) {
    this.current = arg
  }
}

function refreshPath(pathRef: Ref<string[]>) {
  const pathContainer = getElement('#pathManagerContainer');
  pathContainer.innerHTML = '';
  pathContainer.appendChild(<PathDisplay pathRef={pathRef} />);
}

// FIX ME make sure you can't move folders into their own path
// i.e. cant move /folder1/nestedFolder1 into /folder1/nestedFolder1/nestedFolder2
function PathDisplay(
  {
    pathRef,
    index = 0,
  }: {
    pathRef: Ref<string[]>,
    index?: number,
  }
) {
  const path = pathRef.current;
  if (index > path.length) return;
  const slicedPath = path.slice(0, index);
  const segmentDir = UserVault.getCurrentDir(slicedPath, 'preserve');
  if (!segmentDir) throw Error('segment dir is null');
  if (segmentDir.type === 'encryptedFolder') {
    throw Error('segment dir is encrypted');
  }
  const availableDirs = Object.values(segmentDir.contents).filter(
    item => item.type === 'folder'
  );
  return (
    <div className='flex flex-col gap-2'>
      {availableDirs.map(folder => (
        <div className='flex flex-col gap-2'>
          <div className={`py-1 px-2 rounded-lg ${folder.title === path[index] ? 'bg-fg text-bg' : ''}`}
            onClick={() => {
              console.log('setting path', slicedPath.concat(folder.title))
              pathRef.set(slicedPath.concat(folder.title));
              refreshPath(pathRef);
            }}
          >{folder.title}</div>
          {folder.title === path[index] && (
            <div className='pl-2'>
              <PathDisplay pathRef={pathRef}
                index={index + 1}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// FIX ME, path display should just be another DirectoryView
export default function PathManager({ item }: { item: Content }) {
  const pathRef = new Ref([ ...UserVault.currentDir ]);
  return (
    <form className='flex flex-col gap-4' onSubmit={(e) => {
      e.preventDefault();
      console.log(pathRef.get(), item)
      // UserVault.moveItem(item.title, pathRef.get());
      closeModal();
    }}>
      <label className='m-auto'
        htmlFor='pathManagerContainer'
      >Location</label>
      <div className='defaultBorder col-span-2'
        id='pathManagerContainer'
      >
        <PathDisplay pathRef={pathRef} />
      </div>
      <button className='w-full bg-fg text-bg p-2 rounded-lg'
        type='submit'
      >Move</button>
    </form>
  )
}
