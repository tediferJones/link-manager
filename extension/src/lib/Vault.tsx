import DirectoryView from '@/components/directoryView';
import getElement from '@/lib/getElement';
import { decrypt, encrypt, getKey, getRandomBase64 } from '@/lib/encryption';
import { Content, Encrypted } from '@/types.ts';

const newVault: Content<'folder'> = {
  type: 'folder',
  title: '',
  contents: {},
  tags: [],
};

export default class Vault {
  // FIX ME
  // this will make it easier to copy this over to the webpage
  // mode: 'extension' | 'webpage';
  // if we decide vault root cannot be encrypted use this
  // this could also be important for expanding dirs
  // maybe leave it as is until we have that figured out
  // vault: Content<'folder'> | null;
  vault: Content<'folder'> | Content<'encryptedFolder'> | null;
  currentDir: string[];
  savedDir: string[];
  // ExpandedDirs type exists in types.ts file
  // expandedDirs: ExpandedDirs

  constructor()  {
    this.vault = null;
    this.currentDir = [];
    this.savedDir = [];
    // FIX ME, also use localStorage to store vault and currentDir
    // we would need to keep localStorage, chrome.storage.sync, and the database all in sync
    // but then we wouldn't constantly have to check if vault is null
    this.getVault();
  }

  async getVault() {
    const chromeStorage = await chrome.storage.sync.get();
    this.vault = (
      chromeStorage.vault ? JSON.parse(chromeStorage.vault) : newVault
    );
    this.savedDir = chromeStorage.savedDir || [];
    this.render();
  }

  getCurrentDir(path = this.savedDir) {
    if (!this.vault) return;
    this.currentDir = [];
    return path.reduce((folder, title) => {
      if (folder.type === 'encryptedFolder') return folder
      const nextItem = folder.contents[title];
      if (!nextItem) {
        throw Error(`could not find ${title}`);
      } else if (nextItem.type === 'link') {
        throw Error(`${title} is not folder`);
      }
      this.currentDir.push(title);
      return nextItem;
    }, this.vault);
  }

  render() {
    const container = getElement('#directoryView');
    container.innerHTML = '';
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    container.appendChild(<DirectoryView />);
    const breadcrumbs = getElement('#breadcrumbs');
    breadcrumbs.scrollLeft = breadcrumbs.scrollWidth;
  }

  async save() {
    // FIX ME, add package version to saved vault
    // this way if we make breaking changes to vault structure
    // we can apply a function to patch old vaults
    // also add date
    //  - this way we can tell which data is the latest
    //    - if client data is latest push to db
    //    - if server data is latest pull from db
    if (!this.vault || !this.currentDir) return;
    const packed = await this.pack(this.vault as Content<'folder'>);
    console.log('packed', packed);
    await chrome.storage.sync.set({
      vault: JSON.stringify(packed),
      savedDir: this.savedDir,
    });
  }

  // FIX ME, improve types
  async pack(folder: Content<'folder'>): Promise<Content<'folder' | 'encryptedFolder'>> {
    const { encryption, contents, title } = folder;
    let packedContents = Object.fromEntries(
      await Promise.all(
        Object.keys(contents).map(async title => {
          if (contents[title].type === 'folder') {
            return [ title, await this.pack(contents[title]) ];
          } else {
            return [ title, contents[title] ];
          }
        })
      )
    );
    if (encryption) {
      console.log('encrypted', packedContents)
      return {
        type: 'encryptedFolder',
        title,
        data: await encrypt(
          JSON.stringify({
            contents: packedContents,
            tags: folder.tags,
          }),
          encryption.key,
          encryption.iv,
        ),
        salt: encryption.salt,
        iv: encryption.iv,
      }
    } else {
      return {
        type: 'folder',
        title,
        contents: packedContents,
        tags: folder.tags,
      }
    }
  }

  async saveAndRender() {
    await this.save();
    this.render();
  }

  addLink(title: string, href: string) {
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type !== 'folder') throw Error('dir is encrypted')
    const newLink: Content<'link'> = {
      type: 'link',
      title,
      href,
      tags: [],
      // priority: Date.now(),
      priority: Object.keys(dir.contents).reduce((highest, title) => {
        const item = dir.contents[title];
        if (item.type === 'link' && item.priority > highest) {
          return item.priority;
        }
        return highest;
      }, 0) + 1,
    };
    console.log('link priority', newLink.priority)
    dir.contents[title] = newLink;
    this.saveAndRender();
  }

  addFolder(title: string) {
    const newFolder: Content<'folder'> = {
      type: 'folder',
      title,
      contents: {},
      tags: [],
    };
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type !== 'folder') throw Error('dir is encrypted');
    dir.contents[title] = newFolder;
    this.saveAndRender();
  }

  // FIX ME, rename to addEncryption
  async encryptFolder(folder: Content<'folder'>, password: string) {
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type !== 'folder') {
      throw Error('dir is already encrypted');
    }
    const iv = getRandomBase64('iv');
    const salt = getRandomBase64('salt');
    const key = await getKey(password, salt);
    folder.encryption = { key, salt, iv };
    console.log(password, salt, iv)
    this.saveAndRender();
  }

  async decryptFolder(password: string) {
    // FIX ME this is a bit of a mess try to clean it up
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type !== 'encryptedFolder') {
      throw Error('dir is already decrypted');
    }
    const { iv, salt, data } = dir;
    const key = await getKey(password, salt);
    const decryptedData: Encrypted = JSON.parse(
      await decrypt(data, key, iv)
    );
    console.log('decrypted data', decryptedData)
    const newIv = getRandomBase64('iv');
    const newSalt = getRandomBase64('salt');
    const newKey = await getKey(password, newSalt);
    const decryptedFolder: Content<'folder'> = {
      type: 'folder',
      title: dir.title,
      ...decryptedData,
      encryption: {
        key: newKey,
        salt: newSalt,
        iv: newIv,
      }
    }
    const { parentDir, current } = this.getParent();
    if (!parentDir) throw Error('parent dir is null');
    if (parentDir.type !== 'folder') throw Error('parent dir is not a folder');
    parentDir.contents[current] = decryptedFolder;
    this.render();
  }

  async recryptFolder(title: string) {
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type !== 'folder') throw Error('dir is encrypted');
    const folder = dir.contents[title];
    if (folder.type !== 'folder') throw Error('item is not a folder');
    if (!folder.encryption) throw Error('folder is not already encrypted');
    const { encryption, contents } = folder;
    const encrypted: Content<'encryptedFolder'> = {
      type: 'encryptedFolder',
      title,
      data: await encrypt(
        JSON.stringify(contents),
        encryption.key,
        encryption.iv
      ),
      salt: encryption.salt,
      iv: encryption.iv,
    }
    dir.contents[title] = encrypted;
    this.render();
  }

  delete(title: string) {
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type !== 'folder') throw Error('dir is encrypted');
    delete dir.contents[title];
    this.saveAndRender();
  }

  rename(title: string, newTitle: string) {
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type !== 'folder') throw Error('dir is encrypted');
    dir.contents[title].title = newTitle;
    dir.contents[newTitle] = dir.contents[title];
    delete dir.contents[title];
    this.saveAndRender();
  }

  getParent() {
    const parentPath = this.currentDir.slice(0, -1);
    const [ current ] = this.currentDir.slice(-1);
    const parentDir = this.getCurrentDir(parentPath);
    return { parentDir, parentPath, current };
  }

  setDir(keys: string[]) {
    this.currentDir = keys;
    this.savedDir = keys;
    this.saveAndRender();
  }

  // FIX ME
  // if we never actually pass multiple strings to addTags or removeTags just make it a single string
  // while we're at it, rename to addTag and removeTag
  addTags(title: string, tags: string[]) {
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type !== 'folder') throw Error('dir is encrypted');
    if (dir.contents[title].type === 'encryptedFolder') {
      throw Error('item is encrypted');
    }
    const existingTags = dir.contents[title].tags;
    existingTags.push(
      ...tags.filter(newTag => !existingTags.includes(newTag))
    );
    this.saveAndRender();
  }

  removeTags(title: string, tags: string[]) {
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type !== 'folder') throw Error('dir is encrypted');
    if (dir.contents[title].type === 'encryptedFolder') {
      throw Error('item is encrypted');
    }
    dir.contents[title].tags = dir.contents[title].tags.filter(
      extTag => !tags.includes(extTag)
    );
    this.saveAndRender();
  }

  // use for auto-complete of new tags
  getExistingTags(parent = this.vault, tags = new Set<string>()) {
    if (!parent) throw Error('vault is null');
    if (parent.type === 'encryptedFolder') return;
    Object.keys(parent.contents).forEach(title => {
      const item = parent.contents[title];
      if (item.type === 'encryptedFolder') return;
      item.tags.forEach(tag => tags.add(tag));
      if (item.type === 'folder') {
        this.getExistingTags(item, tags);
      }
    });
    return [ ...tags ];
  }

  toggleWatched(title: string) {
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type === 'encryptedFolder') throw Error('dir is encrypted');
    const item = dir.contents[title];
    if (item.type !== 'link') throw Error('item is not a link');
    if (item.watched) {
      delete item.watched;
    } else {
      item.watched = Date.now();
    }
    this.saveAndRender();
  }

  // FIX ME, re-write this, swaps don't always swap as expected
  // does it even make sense to keep priority value on watched links?
  setPriority(title: string, type: 'up' | 'down') {
    console.log('moving', title, type)
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type !== 'folder') throw Error('dir is encrypted');
    const item = dir.contents[title];
    if (item.type !== 'link') throw Error('item is not a link');
    const { swapItem } = (
      Object.values(dir.contents).reduce((closest, checkItem) => {
        if (item === checkItem) return closest;
        if (checkItem.type === 'link' && !checkItem.watched) {
          // const diff = checkItem.priority - closest.swapItem.priority;
          const diff = item.priority - checkItem.priority;
          console.log(diff, item.priority, checkItem.priority)
          if (diff < 0 && type === 'down') {
            return closest;
          } else if (diff > 0 && type === 'up') {
            return closest;
          } else if (Math.abs(diff) < closest.diff) {
            return {
              swapItem: checkItem,
              diff,
            }
          }
        }
        return closest;
      }, { swapItem: item, diff: Infinity })
    );

    console.log('swapping', item, swapItem);
    [
      item.priority,
      swapItem.priority,
    ] = [
        swapItem.priority,
        item.priority,
      ];

    this.saveAndRender();
  }
}
