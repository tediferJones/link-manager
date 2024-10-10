import type { Record, Vault } from '@/types';
import { decrypt, encrypt, getFullKey, getRandBase64 } from '@/lib/security';
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
        await this.reduceVault()
      )
    );
  }

  render() {
    clearChildren('directoryContainer')
      .append(...this.getVaultList())
  }

  getCurrentFolder() {
    return this.folder.reduce(
      (currentLoc, key) => currentLoc = currentLoc.contents[key] as Vault,
      this.vault
    )
  }

  addLink({ title, url }: { title: string, url: string }) {
    this.getCurrentFolder().contents[title] = { url, viewed: false };
    this.save();
    this.render();
  }

  addFolder({ title }: { title: string }) {
    this.getCurrentFolder().contents[title] = { contents: {} };
    this.save();
    this.render();
  }

  deleteItem(folder: Vault, key: string) {
    delete folder.contents[key];
    this.save();
    this.render();
  }

  async encryptFolder(folder: Vault, password: string) {
    const salt = getRandBase64('salt');
    const iv = getRandBase64('iv');
    const fullKey = await getFullKey(password, salt);
    const encrypted = await encrypt(
      JSON.stringify(folder.contents),
      fullKey,
      iv,
    );
    console.log('raw content', JSON.stringify(folder.contents))
    console.log('encrypted', encrypted);
    console.log('password', password);

    folder.locked = {
      data: encrypted,
      iv,
      salt,
      fullKey,
    }
    this.save();
    this.render();
  }

  async decryptFolder(folder: Vault, password: string) {
    console.log(folder)
    if (!folder.locked) throw Error('this folder is not locked')
    const { data, iv, salt } = folder.locked
    const fullKey = await getFullKey(password, salt)

    // We need to catch if decrypt throws an error, this means the password was incorrect
    const decrypted = await decrypt(data, fullKey, iv)
    console.log('decrypted data', decrypted);

    folder.contents = JSON.parse(decrypted);
    folder.locked.fullKey = fullKey
    this.render()
  }

  async reduceVault(vault = this.vault) {
    return await Object.keys(vault.contents).reduce(async (newVaultPromise, key) => {
      const newVault = await newVaultPromise;
      if ((vault.contents[key] as Vault).contents) {
        // const result = await reduceVault(this.vault.contents[key] as Vault);
        const result = await this.reduceVault(vault.contents[key] as Vault);
        const locked = (vault.contents[key] as Vault).locked
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
        newVault.contents[key] = vault.contents[key];
      }
      return newVault;
    }, Promise.resolve({ contents: {} } as Vault));
  }

  getVaultList(
    folder: Vault = this.vault,
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
      }

      return (folder.contents[key] as Record).url ? renderLink(props, this)
        : (folder.contents[key] as Vault).contents ? renderFolder(props, this)
          : renderLockedFolder(props, this)
    })
  }
}
