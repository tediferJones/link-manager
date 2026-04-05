import { packFolder } from '@/app/lib/newVault/core';
import { unwrap } from '@/app/lib/newVault/result';
import { newUserVault } from '@/app/lib/app/userVault';
import { compress } from '@/app/lib/utils/compression';
import { Vault } from '@/app/types';
import fetchWithJwt from '@/app/lib/utils/fetchWithJwt';
import { apiUrl } from '@/shared/constants';

// FIX ME move to constants
const storageKey = 'newUserVault';

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
  const { jwt, ws, ...userVault } = newUserVault
  const savedVault: Vault = { ...userVault, root: packed };
  const compressed = await compress(JSON.stringify(savedVault));

  if (chrome.runtime?.id) {
    await chrome.storage.sync.set({ [storageKey]: compressed });
  } else {
    window.localStorage.setItem(storageKey, compressed);
  }

  console.log('fetchWithJwtBody', compressed)
  const uploadVaultRes = await fetchWithJwt(`${apiUrl}/vault`, {
    method: 'PUT',
    body: compressed,
  });
  console.log('uploadVaultRest', uploadVaultRes)
}
