import DirectoryView from '@/components/directoryView';
import getElement from '@/lib/getElement';
import Vault from '@/lib/Vault';

export default function App() {
  const UserVault = new Vault();
  console.log('vault', UserVault);
  return (
    <div className='p-4 flex flex-col gap-4 min-w-[360px] max-w-[720px]'>
      <div className='flex'>
        <h1 className='text-2xl font-bold text-blue-500 m-auto'>
          LINK MANAGER
        </h1>
        <div className='relative'>
          <button className='defaultBorder text-xl'
            onClick={() => {
              const dropdown = getElement<HTMLDivElement>('#settingsDropdown')!;
              dropdown.classList.toggle('h-[0%]');
              dropdown.classList.toggle('h-fit');
              dropdown.classList.toggle('defaultBorder');
            }}
          >👤</button>
          <div className='absolute bg-white right-0 mt-1 z-10 text-nowrap h-[0%] flex flex-col gap-2 transition-all duration-300 overflow-hidden'
            id='settingsDropdown'
          >
            <div>Login Status</div>
            <hr />
            <div>Dark/Light mode selector</div>
          </div>
        </div>
      </div>
      <form className='flex gap-4'>
        <button className='text-xl defaultBorder'
          title='Go to parent directory'
        >⬆️</button>
        <input className='flex-1 text-lg defaultBorder w-[1px]'
          placeholder='Title'
          id='titleInput'
        />
        <button className='text-xl defaultBorder'
          title='Add link'
          type='button'
          onClick={() => {
            const title = getElement<HTMLInputElement>('#titleInput')!.value;
            const href = getElement<HTMLInputElement>('#hrefInput')!.value;
            UserVault.addLink(title, href);
          }}
        >➕</button>
        <button className='text-xl defaultBorder'
          title='Create folder'
          type='button'
          onClick={() => {
            const title = getElement<HTMLInputElement>('#titleInput')!.value;
            UserVault.addFolder(title);
          }}
        >📁</button>
      </form>
      <div className='defaultBorder' id='directoryView'>
        <DirectoryView contents={UserVault.currentDir.contents} />
      </div>
    </div>
  )
}
