import DirectoryView from '@/components/directoryView';
import getElement from '@/lib/getElement';
import Vault from '@/lib/Vault';
import setTheme from './lib/setTheme';

function handleFormInput() {
  const titleElement = getElement<HTMLInputElement>('#titleInput');
  titleElement.setCustomValidity('');
  const title = titleElement.value;
  const href = getElement<HTMLInputElement>('#hrefInput').value;
  const submitBtn = getElement<HTMLButtonElement>('#submitItemBtn');

  if (title && href) {
    submitBtn.innerText = '🔗 Add Link';
    submitBtn.disabled = false;
    submitBtn.classList.remove('!cursor-not-allowed');
    submitBtn.classList.remove('opacity-50');
  } else if (title) {
    submitBtn.innerText = '📁 Add Folder';
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

// FIX ME move these somewhere else
export const UserVault = new Vault();
(window as any).vault = UserVault;
setTheme();

export default function App() {
  console.log('vault', UserVault);
  return (
    <div className='p-4 flex flex-col min-w-[360px] max-w-[720px]'>
      <div className='mb-4 flex items-center justify-between gap-4'>
        <div className='flex justify-between gap-2'>
          <button className='text-xl defaultBorder'
            title='Go to parent directory'
            onClick={() => UserVault.exitDir()}
          >⬆️</button>
          <button className='text-xl defaultBorder'
            title='Add item'
            onClick={() => {
              const form = getElement('#newItemForm');
              form.classList.toggle('max-h-0');
              form.classList.toggle('max-h-[9999px]');
              form.classList.toggle('defaultBorder');
              form.classList.toggle('mb-4');
            }}
          >➕</button>
        </div>
        <h1 className='text-nowrap text-2xl font-bold text-blue-500 m-auto'>
          LINK MANAGER
        </h1>
        <div className='relative flex gap-2 ml-auto'>
          <div className='defaultBorder text-xl'>☁️</div>
          <div>
            <button className='defaultBorder text-xl'
              onClick={() => {
                const dropdown = getElement<HTMLDivElement>('#settingsDropdown');
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
              <button onClick={() => {
                const savedTheme = localStorage.getItem('theme');
                const newTheme = savedTheme === 'light' ? 'dark' : 'light';
                document.documentElement.className = newTheme;
                localStorage.setItem('theme', newTheme);
              }}>Toggle theme</button>
            </div>
          </div>
        </div>
      </div>
      <form className='w-full flex flex-col gap-4 max-h-0 overflow-hidden transition-all duration-300'
        id='newItemForm'
        onSubmit={(e) => {
          e.preventDefault();
          const titleInput = getElement<HTMLInputElement>('#titleInput');
          const hrefInput = getElement<HTMLInputElement>('#hrefInput');
          const title = titleInput.value;
          const href =  hrefInput.value;
          if (!title) throw Error('missing title');
          if (!UserVault.currentDir) throw Error('currentDir is null');
          if (UserVault.currentDir?.contents[title]) {
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
        <button className='!cursor-not-allowed bg-blue-500 p-2 rounded-lg text-white opacity-50'
          id='submitItemBtn'
          disabled={true}
        >Add</button>
      </form>
      <div className='defaultBorder flex flex-col gap-2'
        id='directoryView'
      >
        <DirectoryView contents={UserVault.currentDir?.contents} />
      </div>
    </div>
  )
}
