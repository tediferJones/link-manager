import t from '@/lib/getTag';
import type VaultManager from '@/lib/VaultManager';

export default function queueController(vaultMan: VaultManager) {
  chrome.storage.local.get('playlist').then(({ playlist }) => {
    // console.log(JSON.stringify(playlist))
    const btn = document.querySelector('#primaryAction')! as HTMLButtonElement;
    if (playlist) {
      btn.textContent = '⏹';
      btn.onclick = () => {
        chrome.storage.local.remove('playlist');
        vaultMan.render();
      }
    } else {
      btn.textContent = '▶';
      btn.onclick = () => {
        vaultMan.setPlaylist(vaultMan.currentLocation);
        vaultMan.render();
      }
    }
    // btn.textContent = playlist ? '⏹' : '▶';
    // btn.onclick = () => {
    //   if (playlist) {
    //     chrome.storage.local.remove('playlist');
    //   } else {
    //     vaultMan.setPlaylist(vaultMan.currentLocation);
    //   }
    //   vaultMan.render();
    // }
    // btn.onclick = playlist
    //   ? () => chrome.storage.local.remove('playlist')
    //   : () => vaultMan.setPlaylist(vaultMan.currentLocation)
  })

  return t('div', { className: 'flex justify-center gap-4 text-2xl' }, [
    t('button', { textContent: '⏪' }),
    // t('button', {
    //   textContent: '▶',
    //   onclick: () => vaultMan.setPlaylist(vaultMan.currentLocation)
    // }),
    t('button', {
      id: 'primaryAction',
      // textContent: '▶',
      // onclick: () => vaultMan.setPlaylist(vaultMan.currentLocation)
    }),
    t('button', { textContent: '⏩' }),
    t('button', {
      textContent: '🔄',
      onclick: () => {
        vaultMan.currentLocation.queueStart = 0
        vaultMan.saveAndRender();
      }
    })
  ])
}
