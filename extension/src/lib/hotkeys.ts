import getElement from '@/lib/getElement';
import UserVault from '@/lib/userVault';
import { HotKeyOpts } from '@/types';

function isHotKey(key: string): key is HotKeyOpts {
  return key in hotKeys;
}

const hotKeys: { [K in HotKeyOpts]: () => void } = {
  '+': () => getElement<HTMLButtonElement>('#addItemBtn').click(),
  'H': () => UserVault.setDir([]),
  'U': () => UserVault.setDir(UserVault.path.slice(0, -1)),
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
