import type { Record, Vault } from '@/types'
import { getFullKey, getRandBase64, encrypt } from './security';

export default async function reduceVault(vault: Vault): Promise<Vault> {
  return await Object.keys(vault.contents).reduce(async (newVaultPromise, key) => {
    const newVault = await newVaultPromise;

    if ((vault.contents[key] as Record).url) {
      newVault.contents[key] = vault.contents[key];
    } else if ((vault.contents[key] as Vault).locked) {
      const { fullKey, ...locked } = (vault.contents[key] as Vault).locked!;

      // Perform your asynchronous operations (like encryption) here
      // const salt = getRandBase64('salt');
      // const iv = getRandBase64('iv');
      // const newFullKey = await getFullKey(password, salt);
      // const encrypted = await encrypt(
      //   JSON.stringify(folder.contents[key]),
      //   fullKey,
      //   iv,
      // );

      if (fullKey) {
        locked.data = await encrypt(
          JSON.stringify(vault.contents[key]),
          fullKey,
          locked.iv,
        );
      }
      newVault.contents[key] = { locked } as Vault;

    } else {
      newVault.contents[key] = await reduceVault(vault.contents[key] as Vault);
    }

    return newVault;
  }, Promise.resolve({ contents: {} } as Vault));
}

// export default function reduceVault(vault: Vault) {
//   return Object.keys(vault.contents).reduce((newVault, key) => {
//     if ((vault.contents[key] as Record).url) {
//       newVault.contents[key] = vault.contents[key]
//     } else if ((vault.contents[key] as Vault).locked) {
//       const { fullKey, ...locked } = (vault.contents[key] as Vault).locked!
// 
//       // Testing
//       // Uh we need to get this shit working idk
//       // const salt = getRandBase64('salt');
//       // const iv = getRandBase64('iv');
//       // const newFullKey = await getFullKey(password, salt);
//       // const encrypted = await encrypt(
//       //   JSON.stringify(folder.contents[key]),
//       //   fullKey,
//       //   iv,
//       // );
// 
//       // Mostly working
//       newVault.contents[key] = { locked } as Vault
// 
//       // newVault.contents[key] = { locked: (vault.contents[key] as Vault).locked } as Vault
//     } else {
//       newVault.contents[key] = reduceVault(vault.contents[key] as Vault)
//     }
// 
//     return newVault
//   }, { contents: {} } as Vault)
// }
