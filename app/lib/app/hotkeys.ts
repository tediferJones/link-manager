import { setPath } from '@/app/lib/newVault/sync';
import { newUserVault } from '@/app/lib/app/userVault';
import getElement from '@/app/lib/utils/getElement';
import { HotKeyOpts } from '@/app/types';

function isHotKey(key: string): key is HotKeyOpts {
  return key in hotKeys;
}

const hotKeys: { [K in HotKeyOpts]: () => void } = {
  '+': () => getElement<HTMLButtonElement>('#addItemBtn').click(),
  'H': () => setPath([]),
  'U': () => setPath(newUserVault.path.slice(0, -1)),
}

function useHotkeys(e: KeyboardEvent) {
  if (isHotKey(e.key)) hotKeys[e.key]?.();
}

export function disableHotKeys() {
  removeEventListener('keydown', useHotkeys);
}

export function enableHotKeys() {
  addEventListener('keydown', useHotkeys);
}
