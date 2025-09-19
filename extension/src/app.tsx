import { ChevronUp, CloudUpload, Link, Plus, User } from 'lucide';
import DirectoryView from '@/components/directoryView';
import { Modal, openModal } from '@/components/modal';
import AddItem from '@/components/addItem';
import Icon from '@/components/icon';
import Dropdown from '@/components/dropdown';
import UserVault from '@/lib/userVault';
import { SizeTypes } from '@/types';

// FIX ME decide on spacing either 2 or 4 (should probably go with 4),
// then make sure gap, padding and margin are all the same
// create fancy input component (see movie-tracker for example)
//  - also add ring class to style.css
// Create start.ts file in utils
//  - This should perform the same actions as main.ts
//    - but this way we only have modify one file and everything stays in sync
// Add type prop to App ('sidepanel', 'popup', 'website')
//  - and then give each type size classes to best fit their use case

// FIX ME
// might not need tailwind.config.js, we are using tailwindV4
// https://tailwindcss.com/docs/installation/using-vite
// https://www.youtube.com/watch?v=bupetqS1SMU
// see style.css for example primary color definition

// CHECKLIST
// Add dates to all items (just created at dates)
//  - for links update date when moved to watched or when moved back to links
// Add functionality for items to be moved from one dir to another
//  - with this add this functionality when creating a new item
//    - that way users don't have to manually navigate to the desired destination directory just to create an item
// Add pinned attribute
// Make sure all buttons have title attributes
// Make modal titles consistent, especially in regard to nested modals
//  - we want the back button to automatically revert modal title to whatever the original modal title was
//  - could just deprecate nested modals if we can get move working with other method
//    - remember to revert modal back to original state without nesting
// Do we want a copy function for items?
// Considering making watched its own item type, it will just be a link with an additional watched prop
// Address FIX ME comments

export default function App({ type }: { type: SizeTypes }) {
  console.log('vault', UserVault);

  const typeClasses: { [K in SizeTypes]: string } = {
    sidepanel: 'w-[100vw] h-screen',
    popup: 'w-[480px] max-h-[480px]',
    website: 'max-w-[720px] h-screen',
  }
  
  return (
    // FIX ME, look at pop up, consider a wider min width (maybe 480px) and settings a min height
    <div className={`p-4 flex flex-col gap-4 m-auto ${typeClasses[type]}`}>
      <div className='flex items-center justify-between gap-2'>
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
            // FIX ME
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
          <Dropdown key='userSettings' align='right'>
            <button className='defaultBorder text-xl'
              title='Info'
            >
              <Icon name={User} />
            </button>
            <div className='flex flex-col gap-2 transition-all duration-300'
            >
              <button>Login</button>
              <hr />
              <button onClick={() => {
                const savedTheme = localStorage.getItem('theme');
                const newTheme = savedTheme === 'light' ? 'dark' : 'light';
                document.documentElement.className = newTheme;
                localStorage.setItem('theme', newTheme);
                document.documentElement.offsetHeight;
              }}>Toggle theme</button>
              <hr />
              <button>About</button>
              <hr />
              <button>FAQ</button>
            </div>
          </Dropdown>
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
