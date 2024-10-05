import type { Record, Vault } from '@/types'
import { getFullKey, getRandBase64 } from './security';

export default function reduceVault(vault: Vault) {
  return Object.keys(vault.contents).reduce((newVault, key) => {
    // newVault.contents = { [key]: vault.contents[key].locked || vault.contents[key] }
    // if (vault.contents[key].locked) {
    //   newVault.locked = vault.contents[key].locked
    // } else {
    //   newVault.contents = vault.contents[key]
    // }

    if ((vault.contents[key] as Record).url) {
      newVault.contents[key] = vault.contents[key]
    } else if ((vault.contents[key] as Vault).locked) {
      const { fullKey, ...locked } = (vault.contents[key] as Vault).locked!

      // Testing
      // const salt = getRandBase64('salt');
      // const iv = getRandBase64('iv');
      // const newFullKey = await getFullKey(password, salt);
      // const encrypted = await encrypt(
      //   JSON.stringify(folder.contents[key]),
      //   fullKey,
      //   iv,
      // );

      // Mostly working
      newVault.contents[key] = { locked } as Vault

      // newVault.contents[key] = { locked: (vault.contents[key] as Vault).locked } as Vault
    } else {
      newVault.contents[key] = reduceVault(vault.contents[key] as Vault)
    }

    return newVault
  }, { contents: {} } as Vault)
}
