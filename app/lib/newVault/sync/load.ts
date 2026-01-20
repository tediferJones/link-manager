import { newUserVault } from '@/app/lib/app/userVault';
import { render } from '@/app/lib/newVault/sync';
import { decompress } from '@/app/lib/utils/compression';
import replaceObject from '@/app/lib/utils/replaceObject';
import { Vault } from '@/app/types';

// FIX ME move to constants
const storageKey = 'newUserVault';

export async function load() {
  // new storage strategy:
  // data is only stored in chrome.storage.local and database
  // switch to chrome.storage.local with 'unlimitedStorage' permission
  //  - chrome.storage.local allows for communication between content script and extension

  console.log('LOADING')
  let savedVault: string | null | undefined;
  if (chrome.runtime?.id) {
    // const chromeStorage = await chrome.storage.sync.get();
    // savedVault = chromeStorage[storageKey];
    throw Error('FIX ME chrome storage sync types have changed, see load.ts in app workspace');
  } else {
    savedVault = window.localStorage.getItem(storageKey);
  }

  if (savedVault) {
    const vault: Vault = JSON.parse(await decompress(savedVault));
    replaceObject(newUserVault, vault);
  }

  render();
}
