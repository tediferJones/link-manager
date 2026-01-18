import { newUserVault } from '@/lib/app/userVault';
import { render } from '@/lib/newVault/sync';
import { decompress } from '@/lib/utils/compression';
import replaceObject from '@/lib/utils/replaceObject';
import { Vault } from '@/types';

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
    throw Error('FIX ME load.ts file');
    // const chromeStorage = await chrome.storage.sync.get();
    // savedVault = chromeStorage[storageKey];
  } else {
    savedVault = window.localStorage.getItem(storageKey);
  }

  if (savedVault) {
    const vault: Vault = JSON.parse(await decompress(savedVault));
    replaceObject(newUserVault, vault);
  }

  render();
}
