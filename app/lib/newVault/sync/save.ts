import { packFolder } from '@/lib/newVault/core';
import { unwrap } from '@/lib/newVault/result';
import { newUserVault } from '@/lib/app/userVault';
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
  const packedResult = await packFolder(newUserVault.root);
  const packed = unwrap(packedResult);
  // FIX ME do not compress whole vault, we still want easy access to date and version
  const savedVault: Vault = { ...newUserVault, root: packed }
  const compressed = await compress(JSON.stringify(savedVault));
  // FIX ME move to constants
  const storageKey = 'newUserVault';
  await chrome.storage.sync.set({ [storageKey]: compressed });
}
