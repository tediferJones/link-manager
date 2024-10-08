import type { Record, Vault } from '@/types';
import reduceVault from '@/lib/reduceVault';
import { encrypt } from '@/lib/security';
import { clearChildren } from '@/lib/utils';
import renderLink from '@/components/renderLink';
import renderLockedFolder from '@/components/renderLockedFolder';
import renderFolder from '@/components/renderFolder';

export default class VaultManager {
  vault: Vault
  folder: string[]

  constructor(vault: Vault) {
    this.vault = vault;
    this.folder = [];
  }

  async save() {
    window.localStorage.setItem(
      'vault',
      JSON.stringify(
        await reduceVault(this.vault)
      )
    );
  }

  render() {
    const dir = clearChildren('directoryContainer');
    dir.append(...this.getVaultList(this.vault))
  }

  async reduceVault() {
    return await Object.keys(this.vault.contents).reduce(async (newVaultPromise, key) => {
      const newVault = await newVaultPromise;
      if ((this.vault.contents[key] as Vault).contents) {
        const result = await reduceVault(this.vault.contents[key] as Vault);
        const locked = (this.vault.contents[key] as Vault).locked
        if (locked) {
          if (locked?.fullKey) {
            locked.data = await encrypt(
              JSON.stringify(result.contents),
              locked.fullKey,
              locked.iv,
            );
          }
          newVault.contents[key] = { locked } as Vault;
        } else {
          newVault.contents[key] = { contents: result.contents } as Vault;
        }
      } else {
        newVault.contents[key] = this.vault.contents[key];
      }
      return newVault;
    }, Promise.resolve({ contents: {} } as Vault));
  }

  getVaultList(
    folder: Vault,
    prefix: string[] = [],
    id: string = 'id'
  ) {
    // console.log('folder', folder)
    return Object.keys(folder.contents).sort().map((key, i) => {
      const props = {
        idTest: id + `-${i}`,
        newPrefix: prefix.concat(key),
        hidden: true,
        folder,
        key,
        refs: {
          updateRender: this.render,
          folderLoc: this.folder,
        },
      }
      // console.log('key', key, folder)

      // return (folder.contents[key] as Record).url ? renderLink(props)
      //   : (folder.contents[key] as Vault).locked && !(folder.contents[key] as Vault).contents ? renderLockedFolder(props)
      //     : renderFolder(props, this.getVaultList)

      return (folder.contents[key] as Record).url ? renderLink(props)
        : (folder.contents[key] as Vault).contents ? renderFolder(props, this.getVaultList)
          : renderLockedFolder(props)
    })
  }
}
