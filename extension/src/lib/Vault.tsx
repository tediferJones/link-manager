import DirectoryView from '@/components/directoryView';
import getElement from '@/lib/getElement';
import { decrypt, encrypt, getKey, getRandomBase64 } from '@/lib/encryption';
import {
  Content,
  ContentTypes,
  Encrypted,
  ResultObj,
  SortedKeysHandler,
  SortedKeysTypes,
} from '@/types.ts';
import { compress, decompress } from './compression';

const newVault: Content<'folder'> = {
  type: 'folder',
  title: '',
  contents: {},
  tags: [],
  sortedKeys: {
    pinned: [],
    folders: [],
    links: [],
    watched: [],
  }
};

// FIX ME move to its own file
const handlers: SortedKeysHandler = {
  folders: {
    add: (dir, item) => {
      dir.sortedKeys.folders.push(item.title);
      dir.sortedKeys.folders.sort(
        (a, b) => a.toLowerCase().localeCompare(b.toLowerCase())
      );
    },
    remove: (dir, item) => dir.sortedKeys.folders = dir.sortedKeys.folders.filter(
      folderTitle => folderTitle !== item.title
    ),
  },
  links: {
    add: (dir, item) => dir.sortedKeys.links.unshift(item.title),
    remove: (dir, item) => dir.sortedKeys.links = dir.sortedKeys.links.filter(
      linkTitle => linkTitle !== item.title
    ),
  },
  watched: {
    add: (dir, item) => dir.sortedKeys.watched.unshift(item.title),
    remove: (dir, item) => dir.sortedKeys.watched = dir.sortedKeys.watched.filter(
      watchedTitle => watchedTitle !== item.title
    ),
  },
  pinned: {
    add: (dir, item) => dir.sortedKeys.pinned.push(item.title),
    remove: (dir, item) => dir.sortedKeys.pinned = dir.sortedKeys.pinned.filter(
      pinnedTitle => pinnedTitle !== item.title
    ),
  }
}
const typeMap: { [K in ContentTypes]: SortedKeysTypes } = {
  link: 'links',
  folder: 'folders',
  encryptedFolder: 'folders',
  watched: 'watched',
}

// FIX ME where possible don't use title to identify resource
// pass the item to the method, and then use Object.assign(item, changedItem)
// this will maintain the reference and allow updates

// This class is getting very large
// consider only keep core functionality in class like add, update, delete, etc...
// for the most part these methods are only called in one place, just write the code in the component
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
  toMove?: { item: Content, dir: string[] }
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
    // FIX ME switch to chrome.storage.local with 'unlimitedStorage' permission
    const chromeStorage = await chrome.storage.sync.get();
    this.vault = (
      chromeStorage.vault ? JSON.parse(await decompress(chromeStorage.vault)) : newVault
    );
    this.savedDir = chromeStorage.savedDir || [];
    this.render();
  }

  getCurrentDir(path = this.savedDir, preserve?: 'preserve') {
    if (!this.vault) return;
    if (!preserve) this.currentDir = [];
    return path.reduce((folder, title) => {
      if (folder.type === 'encryptedFolder') return folder
      const nextItem = folder.contents[title];
      if (!nextItem) {
        throw Error(`could not find ${title}`);
      } else if (nextItem.type === 'link') {
        throw Error(`${title} is not a folder`);
      } else if (nextItem.type === 'watched') {
        throw Error(`${title} is not a folder`);
      }
      if (!preserve) this.currentDir.push(title);
      return nextItem;
    }, this.vault);
  }

  getCurrentFolder() {
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type === 'encryptedFolder') throw Error('dir is encrypted');
    return dir;
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
    // also add delay to saving and debounce on next save request
    // chrome.storage.sync is capped at 8kb, could use local storage, but thats capped at 8MB
    if (!this.vault || !this.currentDir) return;
    const packed = await this.pack(this.vault as Content<'folder'>);
    const compressed = await compress(JSON.stringify(packed));
    console.log('packed', packed, 'size', compressed.length);
    await chrome.storage.sync.set({
      vault: compressed,
      savedDir: this.savedDir,
    });
  }

  // FIX ME, improve types
  async pack(folder: Content<'folder'>): Promise<Content<'folder' | 'encryptedFolder'>> {
    const { encryption, contents, title, tags, sortedKeys } = folder;
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
      const toEncrypt: Encrypted = {
        contents: packedContents,
        tags,
        sortedKeys,
      }
      return {
        type: 'encryptedFolder',
        title,
        data: await encrypt(
          JSON.stringify(toEncrypt),
          encryption.key,
          encryption.iv,
        ),
        salt: encryption.salt,
        iv: encryption.iv,
      }
    } else {
      return {
        ...folder,
        contents: packedContents,
      }
    }
  }

  async saveAndRender() {
    await this.save();
    this.render();
  }

  // FIX ME merge addLink and addFolder into addItem
  addLink(title: string, href: string) {
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type !== 'folder') throw Error('dir is encrypted')
    const newLink: Content<'link'> = {
      type: 'link',
      title,
      href,
      tags: [],
    };
    dir.contents[title] = newLink;
    dir.sortedKeys.links.unshift(title);
    this.saveAndRender();
  }

  addFolder(title: string) {
    const newFolder: Content<'folder'> = {
      type: 'folder',
      title,
      contents: {},
      tags: [],
      sortedKeys: {
        folders: [],
        links: [],
        watched: [],
        pinned: [],
      }
    };
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type !== 'folder') throw Error('dir is encrypted');
    dir.contents[title] = newFolder;
    dir.sortedKeys.folders.push(title);
    dir.sortedKeys.folders.sort(
      (a, b) => a.toLowerCase().localeCompare(b.toLowerCase())
    );
    this.saveAndRender();
  }

  // FIX ME can we merge all these move methods into one method
  // move(action: start | end | cancel, if action === start require item)
  // also can't change title while moving (rename only works on currentDir)
  //  - so maybe just disable settings of toMove item?
  //  - or come up with an entirely different way to accomplish moving
  //
  // NEW IDEA: just use an input field in itemSettings
  // move method should just be move(title: string, newPath: string[])
  // hitting enter will append current text to path
  // delete on an empty input will delete last segement from path
  // this will be much easier to handle errors
  // and should just be cleaner in general (all settings are in one place)
  startMove(item: Content) {
    this.toMove = {
      item,
      dir: [ ...this.currentDir ],
    }
    this.render();
  }

  endMove(): ResultObj {
    if (!this.toMove) return { success: false, error: 'toMove not assigned' };
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type === 'encryptedFolder') throw Error('dir is encrypted');
    if (dir.contents[this.toMove.item.title]) {
      return { success: false, error: 'Title already exists' };
    }
    dir.contents[this.toMove.item.title] = this.toMove.item;

    const oldDir = this.getCurrentDir(this.toMove.dir, 'preserve');
    if (!oldDir) throw Error('dir is null');
    if (oldDir.type === 'encryptedFolder') throw Error('dir is encrypted');
    delete oldDir.contents[this.toMove.item.title];
    this.modifySortedKeys(oldDir, 'remove', this.toMove.item);

    this.modifySortedKeys(dir, 'add', this.toMove.item);
    delete this.toMove;
    this.saveAndRender();
    return { success: true };
  }

  cancelMove() {
    if (!this.toMove) return;
    const dir = this.getCurrentDir(this.toMove.dir, 'preserve');
    if (!dir) throw Error('dir is null');
    if (dir.type === 'encryptedFolder') throw Error('dir is encrypted');
    dir.contents[this.toMove.item.title] = this.toMove.item;
    this.modifySortedKeys(dir, 'add', this.toMove.item);
    delete this.toMove;
    this.render();
  }

  // FIX ME this is essentially just an add action and remove action
  move(title: string, newPath: string[]) {
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type === 'encryptedFolder') throw Error('dir is encrypted');
    const item = dir.contents[title];
    this.modifySortedKeys(dir, 'remove', item);
    const newDir = this.getCurrentDir(newPath, 'preserve');
    if (!newDir) throw Error('dir is null');
    if (newDir.type === 'encryptedFolder') throw Error('dir is encrypted');
    if (newDir.contents[title]) throw Error('title already exists in new dir');
    newDir.contents[title] = item;
    delete dir.contents[title];
    this.modifySortedKeys(newDir, 'add', item);
    this.saveAndRender();
  }

  copyItem(title: string) {
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type === 'encryptedFolder') throw Error('dir is encrypted');
    const item = dir.contents[title];
    if (!item) throw Error('item not found');
    const itemCopy: Content = JSON.parse(JSON.stringify(item));
    itemCopy.title = `${item.title}-COPY`;
    this.insertItem(dir, itemCopy);
    this.saveAndRender();
  }

  insertItem(folder: Content<'folder'>, item: Content) {
    if (folder.contents[item.title]) throw Error('name already exists');
    folder.contents[item.title] = item;
    this.modifySortedKeys(folder, 'add', item);
  }

  // FIX ME or delete, how do we figure out what prop of sorted keys belongs to?
  // i.e. if title is for a folder, link, or watched
  // if deleted, delete types from types.ts too
  modifySortedKeys(
    dir: Content<'folder'>,
    action: 'add' | 'remove',
    item: Content,
  ) {
    const type = typeMap[item.type];
    handlers[type][action](dir, item);
  }

  // FIX ME, rename to enableEncryption
  // also create method to disableEncryption
  // then make encryptFolder method whose sole purpose to turn Content<'folder'> in Content<'encryptedFolder'>
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

  // FIX ME, this needs to update folder.sortedKeys
  delete(title: string) {
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type !== 'folder') throw Error('dir is encrypted');
    delete dir.contents[title];
    this.saveAndRender();
  }

  // FIX ME, this needs to update folder.sortedKeys
  // also needs to check for name collision
  rename(title: string, newTitle: string): ResultObj {
    const folder = this.getCurrentFolder();
    if (folder.contents[newTitle]) {
      return { success: false, error: 'Title already exists' }
    }
    const item = folder.contents[title];
    this.modifySortedKeys(folder, 'remove', item);
    item.title = newTitle;
    folder.contents[newTitle] = item;
    this.modifySortedKeys(folder, 'add', item);
    delete folder.contents[title];
    this.saveAndRender();
    return { success: true };
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

  toggleWatched(item: Content<'link' | 'watched'>) {
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type === 'encryptedFolder') throw Error('dir is encrypted');
    if (item.type === 'link') {
      const watched: Content<'watched'> = {
        ...item,
        type: 'watched',
        watched: Date.now(),
      }
      Object.assign(item, watched);
      this.modifySortedKeys(dir, 'remove', item);
      this.modifySortedKeys(dir, 'add', item);
    } else if (item.type === 'watched') {
      const { watched, ...rest } = item;
      const link: Content<'link'> = {
        // FIX ME typescript won't throw an error if we try do do this
        // but it should because we are spreading watched into a link
        // ...item,
        ...rest,
        type: 'link'
      }
      Object.assign(item, link);
      this.modifySortedKeys(dir, 'remove', item);
      this.modifySortedKeys(dir, 'add', item);
    }
    this.saveAndRender();
  }

  // new setup, lowest is 0 (top of list), highest is sortedKeys.links.length -1 (bottom of list)
  // to move an item to first or last, just enter diff of Infinity or -Infinity
  swapPriority(title: string, diff: number) {
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type === 'encryptedFolder') throw Error('dir is encrypted');
    const linkIndex = dir.sortedKeys.links.findIndex(
      linkTitle => linkTitle === title
    );
    let newIndex = linkIndex + diff;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= dir.sortedKeys.links.length) {
      newIndex = dir.sortedKeys.links.length - 1;
    }
    if (newIndex === linkIndex) return;
    [
      dir.sortedKeys.links[linkIndex],
      dir.sortedKeys.links[newIndex],
    ] = [
        dir.sortedKeys.links[newIndex],
        dir.sortedKeys.links[linkIndex],
      ];
    this.saveAndRender();
  }
}
