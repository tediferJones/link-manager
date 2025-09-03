import DirectoryView from '@/components/directoryView';
import getElement from '@/lib/getElement';
import { encrypt } from '@/lib/encryption';
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

  getCurrentDir() {
    if (!this.vault) return;
    return this.currentDir.reduce((folder, title) => {
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
      const { encryption, title, ...rest } = dir;
      const encrypted: Content<'encryptedFolder'> = {
        type: 'encryptedFolder',
        title,
        data: await encrypt(JSON.stringify(rest), encryption.key, encryption.iv),
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
    if (dir.type !== 'folder') throw Error('dir is encrypted')
    dir.contents[title] = newFolder;
    this.saveAndRender();
  }

  encryptFolder(title: string, password: string) {
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    if (dir.type !== 'folder') throw Error('dir is encrypted');
    const decrypted = dir.contents[title];
    if (decrypted.type !== 'folder') {
      throw Error('only folders can be encrypted');
    }
    console.log('encrypt', title, password)
  }

  setDir(keys: string[]) {
    this.currentDir = keys;
    this.saveAndRender();
  }
}
