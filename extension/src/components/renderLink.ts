import t from '@/lib/getTag';
import dropdownContents from '@/components/dropdownContents';
import { clearChildren, isFolder } from '@/lib/utils';
import type VaultManager from '@/lib/VaultManager';
import type { Record, Vault } from '@/types';

// export default function renderLink({ id, folder, key }: Props, vaultMan: VaultManager) {
export default function renderLink(id: string, folder: Vault, key: string, vaultMan: VaultManager) {
  const item = folder.contents[key]
  if (isFolder(item)) throw Error('this is a folder not a link')

  function timeStampToSeconds(timestamp: string) {
    return timestamp.split(':').reverse().reduce((total, part, i) => {
      if (i === 0) return Number(part)
      return total + Number(part) * 60 ** i
    }, 0)
  }

  function getWatchPercent(record: Record) {
    if (record.currentTime && record.totalTime) {
      console.log(timeStampToSeconds(record.currentTime) / timeStampToSeconds(record.totalTime))
      return (timeStampToSeconds(record.currentTime) / timeStampToSeconds(record.totalTime)) * 100
    }
  }

  const watchBar = t('div', { className: `rounded-xl h-1 bg-red-500 w-[${50}%]` });
  watchBar.style.width = `${getWatchPercent(item) || 0}%`

  return t('div', {
    id: `header-${id}`,
    className: `p-2 rounded-xl ${item.queuePos === folder.queueStart ? 'bg-blue-300' : item.queuePos < folder.queueStart ? 'bg-gray-200' : ''}`
  }, [
      t('div', { className: 'flex justify-between items-center' }, [
        t('a', {
          id: `title-${id}`,
          className: 'p-2 underline text-blue-600 truncate',
          textContent: `${item.queuePos + 1}.) ${key}`,
          href: item.url,
          target: '_blank',
          rel: 'noopener noreferrer'
        }),
        // t('p', { textContent: `View count: ${item.viewCount}` }),
        t('button', {
          id: `settings-${id}`,
          textContent: '☰',
          className: 'w-8 h-8 flex justify-center items-center border-2 border-blue-600 p-2 rounded-xl',
          onclick: () => {
            const container = document.querySelector(`#edit-${id}`)
            if (!container) throw Error('cant find edit container')
            container.classList.toggle('p-2');
            document.querySelector(`#title-${id}`)?.classList.toggle('rounded-b-none');
            document.querySelector(`#header-${id}`)!.classList.toggle('bg-gray-300')
            if (container.hasChildNodes()) return clearChildren(`edit-${id}`)
            // container.append(...dropdownContents(vaultMan, folder, key, id))
            container.append(
              t('div', { className: 'w-full flex flex-col gap-2' }, [
                t('div', { className: 'p-2 flex justify-around items-center border-2 border-gray-400 rounded-xl' }, [
                  t('p', { textContent: `View count: ${item.viewCount}` }),
                  t('p', { textContent: `Queue position: ${item.queuePos + 1}` }),
                  t('p', { textContent: `${item.currentTime} / ${item.totalTime}` })
                ]),
                t('div', { className: 'flex gap-2' },
                  dropdownContents(vaultMan, folder, key, id)
                )
              ])
            )
          }
        })
      ]),
      // t('div', { className: `rounded-xl h-1 bg-red-500 w-[${getWatchPercent(item) || 0}%]` }),
      watchBar,
      t('div', { id: `edit-${id}`, className: 'flex gap-2 bg-gray-300 rounded-xl rounded-t-none' }),
    ])
}
