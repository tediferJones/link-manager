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
  // this will make it easier to copy this over to the webpage
  // mode: 'extension' | 'webpage';
  vault: Content<'folder'> | Content<'encryptedFolder'> | null;
  currentDir: string[];
  // ExpandedDirs type exists in types.ts file
  // expandedDirs: ExpandedDirs

  constructor()  {
    this.vault = null;
    this.currentDir = [];
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
    this.currentDir = chromeStorage.currentDir || [];
    this.render();
  }

  getCurrentDir(path = this.currentDir) {
    if (!this.vault) return;
    return path.reduce((folder, title) => {
      if (folder.type === 'encryptedFolder') return folder
      const nextItem = folder.contents[title];
      if (!nextItem) {
        throw Error(`could not find ${title}`);
      } else if (nextItem.type === 'link') {
        throw Error(`${title} is not folder`);
      }
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
    if (!this.vault || !this.currentDir) return;
    console.log('packed', await this.pack());
    const packedVault = JSON.stringify(await this.pack());
    await chrome.storage.sync.set({
      // vault: this.vault,
      vault: packedVault,
      currentDir: this.currentDir,
    });
  }

  async pack(dir = this.vault): Promise<Content<'folder' | 'encryptedFolder'>> {
    if (!dir) throw Error('dir is null');
    if (dir.type === 'encryptedFolder') {
      return dir;
    } else if (dir.encryption) {
      // re-encrypt, and return
      const { encryption, title, contents } = dir;
      const encrypted: Content<'encryptedFolder'> = {
        type: 'encryptedFolder',
        title,
        data: await encrypt(JSON.stringify(contents), encryption.key, encryption.iv),
        salt: encryption.salt,
        iv: encryption.iv,
      }
      return encrypted;
    } else {
      // crawl children
      const packedContent = Object.fromEntries(
        await Promise.all(
          Object.keys(dir.contents).map(async (title) => {
            if (dir.contents[title].type === 'link') {
              return [ title, dir.contents[title] ];
            } else {
              return [
                title,
                await this.pack(dir.contents[title])
              ]
            }
          })
        )
      )
      return { ...dir, contents: packedContent };
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
    console.log(password, salt, iv)
    const key = await getKey(password, salt);
    const decryptedContent: Content<'folder'>['contents'] = JSON.parse(
      await decrypt(data, key, iv)
    );
    console.log({ decryptedContent })
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

  // if user wants to re-encrypt a folder without closing/refreshing the app
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
      data: await encrypt(JSON.stringify(contents), encryption.key, encryption.iv),
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
    this.saveAndRender();
  }
}
