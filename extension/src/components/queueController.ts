import t from '@/lib/getTag';
import type VaultManager from '@/lib/VaultManager';

export default function queueController(vaultMan: VaultManager) {
  return t('div', { className: 'flex justify-center gap-4 text-2xl' }, [
    t('button', { textContent: '⏪' }),
    t('button', {
      textContent: '▶',
      onclick: () => vaultMan.setPlaylist(vaultMan.currentLocation)
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
