import { ChevronUp, CloudUpload, Link, Plus, User } from 'lucide';
import DirectoryView from '@/components/directoryView';
import { Modal, openModal } from '@/components/modal';
import AddItem from '@/components/addItem';
import Icon from '@/components/icon';
import getElement from '@/lib/getElement';
import UserVault from '@/lib/userVault';

// FIX ME decide on spacing either 2 or 4 (should probably go with 4),
// then make sure gap, padding and margin are all the same
// create fancy input component (see movie-tracker for example)
//  - also add ring class to style.css
// Add link icon to header h1

// might not need tailwind.config.js, we are using tailwindV4
// https://tailwindcss.com/docs/installation/using-vite
// https://www.youtube.com/watch?v=bupetqS1SMU
// see style.css for example primary color definition

export default function App() {
  console.log('vault', UserVault);
  
  return (
    // FIX ME, look at pop up, consider a wider min width (maybe 480px) and settings a min height
    <div className='p-4 flex flex-col min-w-[360px] max-w-[100vw] md:max-w-[720px] m-auto h-screen'>
      <div className='mb-4 flex items-center justify-between gap-2'>
        <div className='flex justify-between gap-4'>
          <button className='text-xl defaultBorder'
            title='Go to parent directory'
            onClick={() => {
              if (UserVault.currentDir.length) {
                UserVault.setDir(UserVault.currentDir.slice(0, -1));
              }
            }}
          >
            <Icon name={ChevronUp} />
          </button>
          <button className='text-xl defaultBorder'
            title='Add item'
            // instead of having hotkeys programmatically click this button
            // consider just copying the onClick function into hotKeys.ts
            id='addItemBtn'
            onClick={() => openModal('Add Item', <AddItem />)}
          >
            <Icon name={Plus} />
          </button>
        </div>
        <a className='m-auto flex items-center gap-1'
          href='https://www.example.com'
        >
          <Icon name={Link} />
          <h1 className='text-nowrap text-2xl font-bold'>
            LINKMAN
          </h1>
        </a>
        <div className='flex gap-4'>
          <div className='defaultBorder text-xl'>
            <Icon name={CloudUpload} />
          </div>
          {/* FIX ME move user info dropdown to its own component */}
          {/* and add a hotkey so that pressing 'escape' or clicking anywhere outside of the dropdown, will close it */}
          <div className='relative'>
            <button className='defaultBorder text-xl'
              onClick={() => {
                const dropdown = getElement<HTMLDivElement>('#settingsDropdown');
                dropdown.classList.toggle('h-[0%]');
                dropdown.classList.toggle('h-fit');
                dropdown.classList.toggle('defaultBorder');
              }}
            >
              <Icon name={User} />
            </button>
            <div className='absolute dropdown right-0 mt-1 z-10 text-nowrap h-[0%] flex flex-col gap-2 transition-all duration-300 overflow-hidden'
              id='settingsDropdown'
            >
              <div>Login Status</div>
              <hr />
              <button onClick={() => {
                const savedTheme = localStorage.getItem('theme');
                const newTheme = savedTheme === 'light' ? 'dark' : 'light';
                document.documentElement.className = newTheme;
                localStorage.setItem('theme', newTheme);
                document.documentElement.offsetHeight;
              }}>Toggle theme</button>
            </div>
          </div>
        </div>
      </div>
      <div className='defaultBorder flex flex-col gap-2 flex-1 overflow-y-auto'
        id='directoryView'
      >
        <DirectoryView />
      </div>
      <Modal />
    </div>
  )
}
