import { FolderContents } from '@/types';

export default function DirectoryView(
  {
    contents
  }: {
    contents?: FolderContents
  }
) {
  return !contents ? <span>Loading</span> :
    !contents.length ?
      <div className='text-xl font-bold text-gray-500 text-center p-4'>
        No Contents
      </div> :
      <>
        {contents.map(item => {
          if ('href' in item) {
            return <div>Link: {item.title}</div>
          } else if ('encryption' in item) {
            return <div>Encrypted Folder: {item.title}</div>
          } else {
            return <div>Folder: {item.title}</div>
          }
        })}
      </>
}
