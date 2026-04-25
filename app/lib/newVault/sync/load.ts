import { newUserVault } from '@/app/lib/app/userVault';
import { render } from '@/app/lib/newVault/sync';
import replaceObject from '@/app/lib/utils/replaceObject';
import extractVault from '@/app/lib/utils/extractVault';
import fetchWithJwt from '@/app/lib/utils/fetchWithJwt';
import { apiUrl } from '@/shared/constants';
import { Vault } from '@/app/types';

// FIX ME move to constants
const storageKey = 'newUserVault';

export async function load() {
  // new storage strategy:
  // data is only stored in chrome.storage.local and database
  // switch to chrome.storage.local with 'unlimitedStorage' permission
  //  - chrome.storage.local allows for communication between content script and extension

  console.log('LOADING')
  let vault: null | Vault = null;
  if (chrome.runtime?.id) {
    const chromeStorage = await chrome.storage.sync.get();
    if (chromeStorage[storageKey]) {
      vault = await extractVault(chromeStorage[storageKey]);
      console.log('loaded from chrome storage')
    }
  } else {
    const localStorage = window.localStorage.getItem(storageKey);
    if (localStorage) {
      vault = await extractVault(localStorage);
      console.log('loaded from local storage')
    }
  }

  console.log('fetch with jwt')
  const dbVaultRes = await fetchWithJwt(`${apiUrl}/vault`);
  console.log('dbVaultRes', dbVaultRes)
  if (dbVaultRes.ok) {
    const dbVault = await extractVault(await dbVaultRes.json());
    console.log('loaded from api')
    if (!vault || vault.date <= dbVault.date) {
      vault = dbVault;
    } else {
      throw Error('local vault newer than db vault, prompt user to choose');
    }
  }

  if (vault) {
    replaceObject(newUserVault, {
      ...vault,
      jwt: newUserVault.jwt,
      ws: newUserVault.ws,
      userData: newUserVault.userData,
    });
  }

  render();
}
