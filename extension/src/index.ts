import t from './lib/getTag';

document.body.appendChild(
  t('h1', { textContent: 'LINK MANAGER', className: 'p-4 text-center text-2xl font-bold text-blue-500' })
)

const vault = window.localStorage.getItem('vault')

chrome.tabs.query({ active: true }, (tabs) => {
  // console.log(tabs.sort((b, a) => a.lastAccessed - b.lastAccessed)[0].url)
  const currentTab = (
    tabs
    .filter(tab => tab.lastAccessed)
    .sort((b, a) => a.lastAccessed! - b.lastAccessed!)[0]
  );
  document.body.append(
    t('div', { className: 'p-4' }, [
      t('div', { className: 'flex gap-4' }, [
        t('p', { textContent: currentTab.title, className: 'text-nowrap m-auto' }),
        t('button', {
          className: 'p-4 rounded-xl border-2 border-blue-600',
          textContent: 'Add',
          onclick: (e) => {

          }
        })
      ]),
      vault ? t('div', { textContent: 'You have a vault' })
        : t('div', {
          textContent: 'No vault found',
          className: 'p-4 text-center text-xl font-bold text-gray-500'
        })
    ])
  )
});

