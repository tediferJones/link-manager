import { ChevronUp, CloudUpload, Link, Plus, User } from 'lucide';
import DirectoryView from '@/components/directoryView';
import { Modal, openModal } from '@/components/modal';
import AddItem from '@/components/addItem';
import Icon from '@/components/icon';
import getElement from '@/lib/getElement';
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
// Add tags to folders
// Get view sortings working
//  - folders should be sorted alphabetically
//  - links should be sorted by priority
//    - might as well add watched attribute when doing priority
// Add dates to all items (just created at dates)
// Add watch attribute to links
//  - also add button to link list item to toggle/indicate watch status
// Add functionality for items to be moved from one dir to another
//  - with this add this functionality when creating a new item
//    - that way users don't have to manually navigate to the desired destination directory just to create an item
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
    <div className={`p-4 flex flex-col m-auto ${typeClasses[type]}`}>
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

// VAULT BACKUP
//
// {"contents":{"testFolder":{"contents":{"nestedFolder":{"contents":{"nestedFolder2":{"contents":{"nestedFolder3":{"contents":{"nestedFolder4":{"contents":{"nestedFolder5":{"contents":{},"title":"nestedFolder5","type":"folder"}},"title":"nestedFolder4","type":"folder"}},"title":"nestedFolder3","type":"folder"}},"title":"nestedFolder2","type":"folder"}},"title":"nestedFolder","type":"folder"},"nestedLink":{"href":"nestedLink.com","title":"nestedLink","type":"link"},"overflowTest1":{"type":"link","title":"overflowTest1","href":"overflowTest1.com"},"overflowTest2":{"type":"link","title":"overflowTest2","href":"overflowTest2.com"},"overflowTest3":{"type":"link","title":"overflowTest3","href":"overflowTest3.com"},"overflowTest4":{"type":"link","title":"overflowTest4","href":"overflowTest4.com"},"overflowTest5":{"type":"link","title":"overflowTest5","href":"overflowTest5.com"},"overflowTest6":{"type":"link","title":"overflowTest6","href":"overflowTest6.com"},"overflowTest7":{"type":"link","title":"overflowTest7","href":"overflowTest7.com"},"overflowTest8":{"type":"link","title":"overflowTest8","href":"overflowTest8.com"},"overflowTest9":{"type":"link","title":"overflowTest9","href":"overflowTest9.com"},"overflowTest10":{"type":"link","title":"overflowTest10","href":"overflowTest10.com"}},"title":"testFolder","type":"folder"},"testLink":{"href":"testLink.com","title":"testLink","type":"link"},"testEncryptedFolder":{"type":"encryptedFolder","title":"testEncryptedFolder","data":"+XR4a9gWenflYlGmN/tCydQH","salt":"snMP8UyxxBJH90EW+qNRxqHFG7l92tQNzWKpOGTb8nI=","iv":"3a+R/lXxHqc1ysJS"},"testFolderV2":{"type":"encryptedFolder","title":"testFolderV2","data":"62Ne8vwiVPcakM/9Bcldi0VuNsIoZ3zc5tnFQL66ghons9+afreepB+WMm4rtRv9I1obbTvkIE5RUFQmCItY5E+okt1FE86MX1i8G7XS2cqB5lOO78X5Viv4lv1LLFp7Bjilng==","salt":"0oh8zEdysfCHnPRRJF1oT07ruSWqfeSGCair41YcV/U=","iv":"ER29gWykUCbffQ4A"},"testFolderRenameV3":{"type":"folder","title":"testFolderRenameV3","contents":{"willContentsTranser":{"type":"link","title":"willContentsTranser","href":"willContentsTranser.com"}}},"thisIsAReallyLongTitleThisIsAReallyLongTitleThisIsAReallyLongTitleThisIsAReallyLongTitle":{"type":"folder","title":"thisIsAReallyLongTitleThisIsAReallyLongTitleThisIsAReallyLongTitleThisIsAReallyLongTitle","contents":{}},"testActualLink":{"type":"link","title":"testActualLink","href":"https://lucide.dev/icons/?search=lock"},"testActualLinkV2":{"type":"link","title":"testActualLinkV2","href":"https://lucide.dev/icons/?search=lock"},"testActualLinkV4":{"type":"link","title":"testActualLinkV4","href":"http://google.com"},"testActualLinkV5":{"type":"link","title":"testActualLinkV5","href":"https://google.com"},"thisIsAReallyLongLinkNameThisIsAReallyLongLinkNameThisIsAReallyLongLinkNameThisIsAReallyLongLinkName":{"type":"link","title":"thisIsAReallyLongLinkNameThisIsAReallyLongLinkNameThisIsAReallyLongLinkNameThisIsAReallyLongLinkName","href":"https://google.com"},"thisIsAReallyLongEncryptedFolderNameThisIsAReallyLongEncryptedFolderNameThisIsAReallyLongEncryptedFolderNameThisIsAReallyLongEncryptedFolderName":{"type":"encryptedFolder","title":"thisIsAReallyLongEncryptedFolderNameThisIsAReallyLongEncryptedFolderNameThisIsAReallyLongEncryptedFolderNameThisIsAReallyLongEncryptedFolderName","data":"T8vMsiwKLLE24eCdjoUY2DjP","salt":"QEuLEm3EcJBZYamBLGDAbNy/XfosZ6Nh+5LoaO049Cc=","iv":"P4+U5iQS/7WKWUOn"}},"title":"","type":"folder"}
