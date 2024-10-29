import type { Playlist, Record, Vault } from '@/types';
import { decrypt, encrypt, getFullKey, getRandBase64 } from '@/lib/security';
import { clearChildren, isFolder } from '@/lib/utils';
import renderLink from '@/components/renderLink';
import renderLockedFolder from '@/components/renderLockedFolder';
import renderFolder from '@/components/renderFolder';

export default class VaultManager {
  vault: Vault
  currentLocation: Vault

  constructor(vault: Vault) {
    this.vault = vault;
    this.currentLocation = vault;
    this.buildTree(vault) // This will add links to parent directories
  }

  render() {
    document.querySelector('#folderTitle')!.textContent = this.currentLocation.title || 'Home'
    clearChildren('directoryContainer')
      .append(...this.getVaultList())
  }

  async saveAndRender() {
    await chrome.storage.local.set({ vault: await this.reduceVault() });
    this.render();
  }

  addLink({ title, url }: { title: string, url: string }) {
    this.currentLocation.contents[title] = {
      url,
      viewed: false,
      viewCount: 0,
      // queuePos: Infinity,
      //
      // Find greatest queuePos, then set to 1 higher than that
      // queuePos: Object.values(this.currentLocation.contents).reduce((total, val) => {
      //   const item = val as Record
      //   if (item.queuePos > total) total = item.queuePos
      //   return total
      // }, 0) + 1
      queuePos: this.currentLocation.sortedKeys.links.length
    };
    this.setSortedKeys(this.currentLocation);
    this.saveAndRender();
  }

  addFolder({ title }: { title: string }) {
    this.currentLocation.contents[title] = {
      contents: {},
      parent: this.currentLocation,
      title,
      // sortedKeys: [],
      sortedKeys: {
        folders: [],
        links: []
      },
      queueStart: 0
    };
    this.setSortedKeys(this.currentLocation);
    this.saveAndRender();
  }

  deleteItem(folder: Vault, key: string) {
    delete folder.contents[key];
    this.setSortedKeys(this.currentLocation);
    this.saveAndRender();
  }

  renameItem(folder: Vault, key: string, newKey: string) {
    if (!newKey) return 'cannot find new name';
    if (newKey === key) return;
    if (folder.contents[newKey]) return 'name is already taken'

    folder.contents[newKey] = folder.contents[key];
    delete folder.contents[key];
    console.log('after delete', this.currentLocation)
    this.setSortedKeys(this.currentLocation);
    this.saveAndRender();
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
    this.saveAndRender();
  }

  async decryptFolder(folder: Vault, password: string) {
    console.log(folder)
    if (!folder.locked) throw Error('this folder is not locked')
    const { data, iv, salt } = folder.locked
    const fullKey = await getFullKey(password, salt)

    // We need to catch if decrypt throws an error, this means the password was incorrect
    let decrypted
    try {
      decrypted = await decrypt(data, fullKey, iv)
      console.log('decrypted data', decrypted);
    } catch {
      return 'Wrong Password'
    }

    folder.contents = JSON.parse(decrypted);
    folder.locked.fullKey = fullKey
    this.currentLocation = folder
    this.buildTree()
    this.render()
  }

  // This function kinda sucks, it should explicitly remove items instead of implicitly
  async reduceVault(vault = this.vault) {
    // console.log('reduce vault', vault)
    const newVault = {
      contents: {},
      sortedKeys: vault.sortedKeys,
      queueStart: vault.queueStart
    } as Vault
    // console.log('checking', vault, 'building', newVault)
    return await Object.keys(vault.contents).reduce(async (newVaultPromise, key) => {
      const newVault = await newVaultPromise;
      // newVault.sortedKeys = vault.sortedKeys;
      // console.log('name', key, 'save sorted keys', newVault.sortedKeys, vault.sortedKeys)
      if ((vault.contents[key] as Vault).contents) {
        const result = await this.reduceVault(vault.contents[key] as Vault);
        // console.log('result', result)
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
          // newVault.contents[key] = { contents: result.contents } as Vault;
          newVault.contents[key] = { contents: result.contents, sortedKeys: result.sortedKeys } as Vault;
        }
      } else {
        newVault.contents[key] = vault.contents[key];
      }
      // console.log('Final Result', newVault)
      return newVault;
    // }, Promise.resolve({ contents: {} } as Vault));
    }, Promise.resolve(newVault));
  }

  buildTree(folder = this.vault) {
    return Object.keys(folder.contents).forEach(key => {
      if (isFolder(folder.contents[key])) {
        folder.contents[key].parent = folder
        folder.contents[key].title = key
        this.buildTree(folder.contents[key])
      }
    })
  }

  setSortedKeys(folder: Vault) {
    const folders: string[] = [];
    const links: string[] = [];
    Object.keys(folder.contents).forEach(key => {
      const item = folder.contents[key]
      if ((item as Vault).locked || isFolder(item)) {
        folders.push(key)
      } else {
        links.push(key)
      }
    })
    // Sort folders alphabetically and sort links by queuePos
    const sorted = folders.sort().concat(
      links.sort((a, b) => (folder.contents[a] as Record).queuePos - (folder.contents[b] as Record).queuePos)
    )
    // console.log('sorted keys', sorted)
    // folder.sortedKeys = sorted
    folder.sortedKeys = { folders, links }
  }

  getVaultList(
    folder: Vault = this.currentLocation,
    id: string = 'id'
  ) {
    // return Object.keys(folder.contents).sort().map((key, i) => {
    // console.log('rendering', folder.sortedKeys.map(i => console.log(i)))
    // return folder.sortedKeys.map((key, i) => {
    return folder.sortedKeys.folders
      .concat(folder.sortedKeys.links)
      .map((key, i) => {
        const tempId = id + `-${i}`;
        // console.log(folder.contents, key)
        // return (folder.contents[key] as Record).url ? renderLink(tempId, folder, key, this)
        //   : (folder.contents[key] as Vault).contents ? renderFolder(tempId, folder, key, this)
        //     : renderLockedFolder(tempId, folder, key, this)
        return (folder.contents[key] as Record).url ? renderLink(`link-${(folder.contents[key] as Record).queuePos}`, folder, key, this)
          : (folder.contents[key] as Vault).contents ? renderFolder(`folder-${i}`, folder, key, this)
            : renderLockedFolder(`folder-${i}`, folder, key, this)
      })
  }

  async swapQueuePos(record: Record, newPos: number) {
    const sortedLinkKeys = this.currentLocation.sortedKeys.links;
    const linkToSwap = sortedLinkKeys[newPos - 1];
    if (linkToSwap) {
      (this.currentLocation.contents[linkToSwap] as Record).queuePos = record.queuePos;
      record.queuePos = newPos;
    } else {
      const fromIndex = record.queuePos
      console.log('sliced keys', sortedLinkKeys.slice(fromIndex - 1))
      sortedLinkKeys.slice(fromIndex - 1).forEach(key => {
        (this.currentLocation.contents[key] as Record).queuePos -= 1;
      })
      record.queuePos = this.currentLocation.sortedKeys.links.length
    }

    // Delete this if we done end up using negative queuePos
    // const sortedLinkKeys = this.currentLocation.sortedKeys.links;
    // const swapKey = sortedLinkKeys.find(recKey => {
    //   return (this.currentLocation.contents[recKey] as Record).queuePos === newPos;
    // })

    // if (swapKey) {
    //   const swapRec = this.currentLocation.contents[swapKey] as Record
    //   swapRec.queuePos = record.queuePos;
    //   record.queuePos = newPos;
    // } else {
    //   // no record found
    //   // if there is no record found we are outside the current bounds of all queue positions
    // }

    this.setSortedKeys(this.currentLocation);
    await this.saveAndRender();
  }

  async setPlaylist(folder: Vault) {
    // this.currentLocation = folder;
    // console.log(this.reduceVault(this.currentLocation))
    // // What do we actually need to send to the currently open tab?
    // //  - Keep in mind we can have the same url in multiple folders, and the same url multiple times in the same folder
    // // Couldnt we just get away with using chrome.storage.local to store the current playlist?
    // chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
    //   chrome.tabs.sendMessage(tabs[0].id!, await this.reduceVault(this.currentLocation), (response) => {
    //     console.log("Object sent to content script:", response);
    //   });
    // });

    const keys: string[] = [];
    let tempVault: Vault | undefined = folder;
    while (tempVault?.parent) {
      console.log(keys)
      keys.push(folder.title)
      tempVault = folder.parent
    }

    await chrome.storage.local.set({
      playlist: {
        keys: keys.reverse(), // keys that will point to folder
        links: this.currentLocation.sortedKeys.links.map(linkKey => folder.contents[linkKey]) as Record[], // all records in playlist
        queuePos: this.currentLocation.queueStart // get star
      } as Playlist
    })
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id!, 'startPlaylist');
    });
  }
}
