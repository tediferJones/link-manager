import UserVault from '@/lib/userVault';
import getElement from '@/lib/getElement';

function refreshPath(path: string[], changeHandler: Function) {
  changeHandler();
  const pathContainer = getElement('#pathManagerContainer');
  pathContainer.innerHTML = '';
  pathContainer.appendChild(
    <PathDisplay path={path} changeHandler={changeHandler} />
  );
}

// FIX ME make sure you can't move folders into their own path
// i.e. cant move /folder1/nestedFolder1 into /folder1/nestedFolder1/nestedFolder2
function PathDisplay(
  {
    path,
    index = 0,
    changeHandler
  }: {
    path: string[],
    index?: number,
    changeHandler: Function
  }
) {
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
              path = slicedPath.concat(folder.title);
              refreshPath(path, changeHandler);
            }}
          >{folder.title}</div>
          {folder.title === path[index] && (
            <div className='pl-2'>
              <PathDisplay path={path}
                index={index + 1}
                changeHandler={changeHandler}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function PathManager(
  {
    path,
    changeHandler
  }: {
    path: string[],
    changeHandler: Function
  }
) {
  return (
    <>
      <label className='m-auto'
        htmlFor='pathManagerContainer'
      >Location</label>
      <div className='defaultBorder col-span-2'
        id='pathManagerContainer'
      >
        <PathDisplay path={path} changeHandler={changeHandler} />
      </div>
    </>
  )
}
