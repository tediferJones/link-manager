import type { Playlist, Record, Vault } from '@/types';
import { decrypt, encrypt, getFullKey, getRandBase64 } from '@/lib/security';
import { clearChildren, isFolder } from '@/lib/utils';
import renderLink from '@/components/renderLink';
import renderLockedFolder from '@/components/renderLockedFolder';
import renderFolder from '@/components/renderFolder';
import queueController from '@/components/queueController';
import t from '@/lib/getTag';

export default class VaultManager {
  vault: Vault
  currentLocation: Vault

  constructor(vault: Vault) {
    this.vault = vault;
    this.currentLocation = vault;
    this.buildTree(vault) // This will add links to parent directories
  }

  render() {
    const queueContainer = clearChildren('queueController');
    if (this.currentLocation.sortedKeys.links.length > 0) {
      queueContainer.append(queueController(this))
    }
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
      queuePos: this.currentLocation.sortedKeys.links.length
    };
    this.setSortedKeys();
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
    this.setSortedKeys();
    this.saveAndRender();
  }

  deleteItem(folder: Vault, key: string) {
    delete folder.contents[key];
    this.setSortedKeys();
    this.saveAndRender();
  }

  renameItem(folder: Vault, key: string, newKey: string) {
    if (!newKey) return 'cannot find new name';
    if (newKey === key) return;
    if (folder.contents[newKey]) return 'name is already taken'

    folder.contents[newKey] = folder.contents[key];
    delete folder.contents[key];
    console.log('after delete', this.currentLocation)
    this.setSortedKeys();
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
    const newVault = {
      contents: {},
      sortedKeys: vault.sortedKeys,
      queueStart: vault.queueStart
    } as Vault

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
          newVault.contents[key] = { contents: result.contents, sortedKeys: result.sortedKeys } as Vault;
        }
      } else {
        newVault.contents[key] = vault.contents[key];
      }
      return newVault;
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

  setSortedKeys(folder: Vault = this.currentLocation) {
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
    folders.sort();
    links.sort((a, b) => (folder.contents[a] as Record).queuePos - (folder.contents[b] as Record).queuePos)
    folder.sortedKeys = { folders, links }

    // const sorted = folders.sort().concat(links.sort((a, b) => (folder.contents[a] as Record).queuePos - (folder.contents[b] as Record).queuePos))
    // folder.sortedKeys = sorted
  }

  getVaultList(folder: Vault = this.currentLocation) {
    // return folder.sortedKeys.folders
    //   .concat(folder.sortedKeys.links)
    //   .map((key, i) => {
    //     return (folder.contents[key] as Record).url ? renderLink(`link-${(folder.contents[key] as Record).queuePos}`, folder, key, this)
    //       : (folder.contents[key] as Vault).contents ? renderFolder(`folder-${i}`, folder, key, this)
    //         : renderLockedFolder(`folder-${i}`, folder, key, this)
    //   })

    if (!Object.keys(folder.contents).length) {
      return [ t('div', {
        textContent: 'No contents found',
        className: 'p-4 text-center text-xl font-bold text-gray-500'
      }) ]
    }
    return folder.sortedKeys.folders
      .concat(folder.sortedKeys.links)
      .map((key, i) => {
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

    this.setSortedKeys();
    await this.saveAndRender();
  }

  async setPlaylist(folder: Vault) {
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
        queuePos: this.currentLocation.queueStart // get start
      } as Playlist
    })
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id!, 'startPlaylist');
    });
  }
}
