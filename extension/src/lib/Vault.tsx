import DirectoryView from '@/components/directoryView';
import getElement from '@/lib/getElement';
import { decrypt, encrypt, getKey, getRandomBase64 } from '@/lib/encryption';
import { Content } from '@/types.ts';

const newVault = {
  type: 'folder',
  title: '',
  contents: {},
} satisfies Content<'folder'> as Content<'folder'>;

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
      return {
        type: 'encryptedFolder',
        title,
        data: await encrypt(
          JSON.stringify(packedContents),
          encryption.key,
          encryption.iv
        ),
        salt: encryption.salt,
        iv: encryption.iv,
      }
    } else {
      return {
        type: 'folder',
        title,
        contents: packedContents,
      }
    }
  }

  async saveAndRender() {
    await this.save();
    this.render();
  }

  addLink(title: string, href: string) {
    const newLink: Content<'link'> = {
      type: 'link',
      title,
      href,
      tags: [],
    };
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type !== 'folder') throw Error('dir is encrypted')
    dir.contents[title] = newLink;
    this.saveAndRender();
  }

  addFolder(title: string) {
    const newFolder: Content<'folder'> = {
      type: 'folder',
      title,
      contents: {},
    };
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type !== 'folder') throw Error('dir is encrypted');
    dir.contents[title] = newFolder;
    this.saveAndRender();
  }

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
    const decryptedContent: Content<'folder'>['contents'] = JSON.parse(
      await decrypt(data, key, iv)
    );
    const newIv = getRandomBase64('iv');
    const newSalt = getRandomBase64('salt');
    const newKey = await getKey(password, newSalt);
    const decryptedFolder: Content<'folder'> = {
      type: 'folder',
      title: dir.title,
      contents: decryptedContent,
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

  addTags(title: string, tags: string[]) {
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type !== 'folder') throw Error('dir is encrypted');
    if (dir.contents[title].type !== 'link') {
      throw Error('target is not a link');
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
    if (dir.contents[title].type !== 'link') {
      throw Error('target is not a link');
    }
    console.log('after removing', dir.contents[title].tags.filter(
      extTag => !tags.includes(extTag)
    ))
    console.log(dir.contents[title].tags, tags)
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
      if (item.type === 'link') {
        item.tags.forEach(tag => tags.add(tag));
      } else if (item.type === 'folder') {
        this.getExistingTags(item, tags);
      }
    });
    return [ ...tags ];
  }
}
