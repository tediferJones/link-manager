import { isFolder, type Record, type Vault } from '@/types';
import { decrypt, encrypt, getFullKey, getRandBase64 } from '@/lib/security';
import { clearChildren } from '@/lib/utils';
import renderLink from '@/components/renderLink';
import renderLockedFolder from '@/components/renderLockedFolder';
import renderFolder from '@/components/renderFolder';

export default class VaultManager {
  vault: Vault
  folder: string[]
  currentLocation: Vault

  constructor(vault: Vault) {
    this.vault = vault;
    this.folder = [];
    this.currentLocation = vault;
    console.log('constructor', this.buildTree(vault))
  }

  render() {
    // clearChildren('directoryContainer')
    //   .append(...this.getVaultList())

    document.querySelector('#folderTitle')!.textContent = this.currentLocation.parentTitle || 'Root'
    clearChildren('directoryContainer')
      .append(...this.getVaultList())
  }

  async saveAndRender() {
    await chrome.storage.local.set({ vault: await this.reduceVault() });
    this.render();
  }

  getCurrentFolder() {
    return this.currentLocation
    // return this.folder.reduce(
    //   (currentLoc, key) => currentLoc = currentLoc.contents[key] as Vault,
    //   this.vault
    // )
  }

  addLink({ title, url }: { title: string, url: string }) {
    this.getCurrentFolder().contents[title] = {
      url,
      viewed: false,
      viewCount: 0,
    };
    this.saveAndRender();
  }

  addFolder({ title }: { title: string }) {
    this.getCurrentFolder().contents[title] = {
      contents: {},
      parent: this.getCurrentFolder(),
      parentTitle: title,
    };
    this.saveAndRender();
  }

  deleteItem(folder: Vault, key: string) {
    delete folder.contents[key];
    this.saveAndRender();
  }

  async encryptFolder(folder: Vault, password: string) {
    const salt = getRandBase64('salt');
    const iv = getRandBase64('iv');
    const fullKey = await getFullKey(password, salt);
    // const { contents, parent } = folder;
    const encrypted = await encrypt(
      JSON.stringify(folder.contents),
      // JSON.stringify({ contents, parent }),
      fullKey,
      iv,
    );
    // console.log('raw content', JSON.stringify(folder.contents))
    console.log('folder', folder)
    // console.log('raw content', JSON.stringify({ contents, parent }))
    console.log('encrypted', encrypted);
    console.log('password', password);

    folder.locked = {
      data: encrypted,
      iv,
      salt,
      fullKey,
    }
    this.saveAndRender();
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
    // const { contents, parent } = JSON.parse(decrypted);
    // folder.contents = contents;
    // folder.parent = parent;
    folder.locked.fullKey = fullKey
    this.currentLocation = folder
    this.buildTree()
    this.render()
  }

  async reduceVault(vault = this.vault) {
    console.log('reduce vault', vault)
    return await Object.keys(vault.contents).reduce(async (newVaultPromise, key) => {
      const newVault = await newVaultPromise;
      if ((vault.contents[key] as Vault).contents) {
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
          // newVault.contents[key] = { contents: result.contents, parent: result.parent } as Vault;
        }
      } else {
        newVault.contents[key] = vault.contents[key];
      }
      return newVault;
    }, Promise.resolve({ contents: {} } as Vault));
  }

  buildTree(folder = this.vault) {
    return Object.keys(folder.contents).forEach(key => {
      if (isFolder(folder.contents[key])) {
        folder.contents[key].parent = folder
        folder.contents[key].parentTitle = key
        this.buildTree(folder.contents[key])
      }
    })
    // return Object.keys(folder.contents).reduce((newVault, key) => {
    //   if (isFolder(folder.contents[key])) {
    //     folder.contents[key].parent = folder
    //     newVault.contents[key] = folder.contents[key]
    //     this.buildTree(folder.contents[key])
    //   }
    //   return newVault
    // }, { contents: {} } as Vault)
  }

  getVaultList(
    // folder: Vault = this.vault,
    folder: Vault = this.currentLocation,
    prefix: string[] = [],
    id: string = 'id'
  ) {
    return Object.keys(folder.contents).sort().map((key, i) => {
      const tempId = id + `-${i}`;
      // const item = folder.contents[key]
      return (folder.contents[key] as Record).url ? renderLink(tempId, folder, key, this)
        : (folder.contents[key] as Vault).contents ? renderFolder(tempId, folder, key, this)
          : renderLockedFolder(tempId, folder, key, this)

      // const props = {
      //   idTest: id + `-${i}`,
      //   newPrefix: prefix.concat(key),
      //   hidden: true,
      //   folder,
      //   key,
      // }

      // return (folder.contents[key] as Record).url ? renderLink(props, this)
      //   : (folder.contents[key] as Vault).contents ? renderFolder(props, this)
      //     : renderLockedFolder(props, this)
    })
  }
}
