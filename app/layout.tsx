import { ChevronUp, CloudUpload, Link, Plus, User } from 'lucide';
import { Modal } from '@/app/components/layout';
import { Dropdown, Icon, Loading } from '@/app/components/ui';
import { AddItem } from '@/app/components/forms';
import { openModal } from '@/app/effects';
import { newUserVault } from '@/app/lib/app/userVault';
import { setPath } from '@/app/lib/newVault/sync';
import { getViewPath } from '@/app/lib/newVault/utils';
import { authContainerId } from '@/app/lib/constants';
import { SizeTypes } from '@/app/types';

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
// Tailwind problems could be fixed by creating a new project
// I have no idea why postcss is installed 
//  - which could be causing problems with defining special classes like hover:ring
//  - will also probably need to update LSP

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
// make all scrollareas overflow-y-scroll
//  - add goofy padding to make items appear centered
//  - only exception could be directoryView component
// Address FIX ME comments
// Break up lib/components folder into sub folders
//  - lib could have utils/, vaultUtils/, etc...
//  - would be good to break up vault functions too
// If it seems reasonable, write tests for /lib/app
// Consider creating index.ts files to unify exports for lib folders
//  - for example: 
//    - create /lib/utils/index.ts
//    - do export * from './file.ts'
//    - then instead of doing:
//        import { file } from '@/app/lib/utils/file'
//        import { file2 } from '@/app/lib/utils/file2'
//    - you can just do:
//        import { file, file2 } from '@/app/lib/utils'
// In theory, in vite.config.ts test.environment should be jsdom, but some APIs don't exist
//  - Most test should be fine with jsdom, instead of specifying jsdom maybe specify node where needed
// Make getNewSortedKeys function
// Consider getting rid of getElement function
//  - could just be replaced with document.querySelector(someId)!.whateverProp
//  - only down side is uglier error messages
//    - getElement tells us exactly what id could not be found
//    - querySelector just says "cannot read properties of null"
// Add gestures
//  - swipe from left to right to navigate up one directory
//  - pull down from top to refresh
// Add symlink type?
//  - will need to add uuids to all items
//  - would allows a single item to show up in multiple places which could be useful
// Add tracking/following to links?
//  - update link url as user navigates from page to page
// Standardize timestamps:
//  - jwt exp is true unix time i.e. seconds
//  - Date.now() which is used pretty much everywhere else is ms
// Separate data that should be synced from data that is not synced
//  - take a look at save.ts and load.ts we are constantly trying to do
//    - when saving we do "back this stuff up but not this stuff"
//    - when loading we do "this cloud data replaces this data but not this other data"
//  - instead just make UserSession an object with two fields, vault and session
//    - vault contains everything that gets backed up
//    - session contains everything that does NOT get backed up

// FIX ME rename to layout.tsx, move start.ts to index.ts at root of repo, this should be entry point of the app
export default function App({ type }: { type: SizeTypes }) {
  // FIX ME, for debug purposes only
  (window as any).newVault = newUserVault;
  console.log('newVault', newUserVault);

  const typeClasses: { [K in SizeTypes]: string } = {
    sidepanel: 'w-[100vw] h-screen',
    popup: 'w-[480px] max-h-[480px]',
    website: 'max-w-[720px] h-screen',
  }
  
  return (
    // FIX ME, look at pop up, consider a wider min width (maybe 480px) and settings a min height
    <div className={`p-4 flex flex-col gap-4 m-auto ${typeClasses[type]}`}>
      {/* // FIX ME consider moving header to its own component */}
      <div className='flex items-center justify-between gap-2'>
        <div className='flex justify-between gap-4'>
          <button className='text-xl defaultBorder'
            title='Go to parent directory'
            onClick={() => {
              const { root, path } = newUserVault;
              if (newUserVault.path.length) {
                setPath(getViewPath(root, path).slice(0, -1));
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
            <div className='flex flex-col gap-2 transition-all duration-300'>
              <div id={authContainerId} className='m-auto'>
                Loading...
              </div>
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
        <Loading />
      </div>
      <Modal />
    </div>
  )
}
