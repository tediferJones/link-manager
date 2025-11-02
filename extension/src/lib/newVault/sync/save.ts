import { packFolder, unwrap } from '@/lib/newVault';
import { userVault } from '@/lib/app/newUserVault';
import { compress } from '@/lib/utils/compression';
import { Vault } from '@/types';

export async function save() {
  // FIX ME, add package version to saved vault
  // this way if we make breaking changes to vault structure
  // we can apply a function to patch old vaults
  // also add date
  //  - this way we can tell which data is the latest
  //    - if client data is latest push to db
  //    - if server data is latest pull from db
  // also add delay to saving and debounce on next save request
  const packed = unwrap(await packFolder(userVault.root));
  const savedVault: Vault = { ...userVault, root: packed }
  const compressed = await compress(JSON.stringify(savedVault));
  // FIX ME move to constants
  const storageKey = 'userVault';
  await chrome.storage.sync.set({ [storageKey]: compressed });
}
