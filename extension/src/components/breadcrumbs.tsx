import { UserVault } from '@/app';

export default function Breadcrumbs() {
  return (
    <div className='flex gap-2'>
      {[ '~', ...UserVault.currentDir ].map((key, i, arr) => (
        <>
          <span className='hover:underline text-blue-500 cursor-pointer'
            onClick={() => UserVault.setDir(arr.slice(1, i + 1))}
          >{key}</span>
          <span>/</span>
        </>
      ))}
    </div>
  )
}
