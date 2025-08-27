import Vault from '@/lib/Vault';

export default function DirectoryView(
  {
    contents
  }: {
    contents: Vault['currentDir']['contents']
  }
) {
  return !contents.length ?
    <div className='text-xl font-bold text-gray-500 text-center p-4'>
      No Contents
    </div> :
    <>
      {contents.map(item => (
        <div>{item.title}</div>
      ))}
    </>
}
