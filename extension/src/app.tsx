import { ChevronUp, CloudUpload, Folder, Link2, Plus, User } from 'lucide';
import DirectoryView from '@/components/directoryView';
import getElement from '@/lib/getElement';
import Icon from '@/components/icon';
import UserVault from '@/lib/userVault';
import { Modal } from '@/components/modal';

function handleFormInput() {
  const titleElement = getElement<HTMLInputElement>('#titleInput');
  titleElement.setCustomValidity('');
  const title = titleElement.value;
  const href = getElement<HTMLInputElement>('#hrefInput').value;
  const submitBtn = getElement<HTMLButtonElement>('#submitItemBtn');

  if (title && href) {
    submitBtn.innerHTML = '';
    submitBtn.appendChild(
      <span className='flex gap-2 justify-center'>
        <Icon name={Link2} />
        <span>Add Link</span>
      </span>
    )
    submitBtn.disabled = false;
    submitBtn.classList.remove('!cursor-not-allowed');
    submitBtn.classList.remove('opacity-50');
  } else if (title) {
    submitBtn.innerHTML = '';
    submitBtn.appendChild(
      <span className='flex gap-2 justify-center'>
        <Icon name={Folder} />
        <span>Add Folder</span>
      </span>
    )
    submitBtn.disabled = false;
    submitBtn.classList.remove('!cursor-not-allowed');
    submitBtn.classList.remove('opacity-50');
  } else {
    submitBtn.innerText = 'Add';
    submitBtn.disabled = true;
    submitBtn.classList.add('!cursor-not-allowed');
    submitBtn.classList.add('opacity-50');
  }
}

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
  
  addEventListener('keydown', (e) => {
    if (e.key === '+') {
      console.log('open add new entry');
    }
  });

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
            onClick={() => {
              const form = getElement('#newItemForm');
              form.classList.toggle('max-h-0');
              form.classList.toggle('max-h-[9999px]');
              form.classList.toggle('defaultBorder');
              form.classList.toggle('mb-4');
            }}
          >
            <Icon name={Plus} />
          </button>
        </div>
        <h1 className='text-nowrap text-2xl font-bold text-primary m-auto'>
          LINKMAN
        </h1>
        <div className='flex gap-4'>
          <div className='defaultBorder text-xl'>
            <Icon name={CloudUpload} />
          </div>
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
      {/* FIX ME move this into a modal */}
      {/*
      Otherwise check what happens if opening dropdown causes list content to overflow,
      will the scrollbar and its padding appear?
      */}
      <form className='w-full flex flex-col gap-2 max-h-0 overflow-hidden transition-all duration-300'
        id='newItemForm'
        onSubmit={(e) => {
          e.preventDefault();
          const titleInput = getElement<HTMLInputElement>('#titleInput');
          const hrefInput = getElement<HTMLInputElement>('#hrefInput');
          const title = titleInput.value;
          const href =  hrefInput.value;
          if (!title) throw Error('missing title');
          const dir = UserVault.getCurrentDir();
          if (!dir) throw Error('dir is null');
          if (dir.type !== 'folder') throw Error('dir is encrypted')
          if (dir.contents[title]) {
            // show submit error that name already exists
            console.log('use custom validity message')
            titleInput.setCustomValidity('Name already taken');
            e.currentTarget.reportValidity();
            return;
          }
          if (href) {
            UserVault.addLink(title, href);
          } else {
            UserVault.addFolder(title);
          }
          titleInput.value = '';
          hrefInput.value = '';
        }}
      >
        <input className='defaultBorder flex-1'
          placeholder='Title'
          id='titleInput'
          onInput={handleFormInput}
          required
        />
        <input className='defaultBorder flex-1'
          placeholder='Link'
          id='hrefInput'
          onInput={handleFormInput}
        />
        <button className='!cursor-not-allowed bg-primary text-bg p-2 rounded-lg opacity-50'
          id='submitItemBtn'
          disabled={true}
        >Add</button>
      </form>
      <div className='defaultBorder flex flex-col gap-2 flex-1 overflow-y-auto'
        id='directoryView'
      >
        <DirectoryView />
      </div>
      <Modal />
    </div>
  )
}
