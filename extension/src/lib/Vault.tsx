import DirectoryView from '@/components/directoryView';
import getElement from '@/lib/getElement';
import { Content } from '@/types.ts';

const newVault = {
  type: 'folder',
  title: '',
  contents: {},
} satisfies Content<'folder'> as Content<'folder'>;

export default class Vault {
  // this will make it easier to copy this over to the webpage
  // mode: 'extension' | 'webpage';
  vault: Content<'folder'> | null;
  currentDir: string[];
  // ExpandedDirs type exists in types.ts file
  // expandedDirs: ExpandedDirs

  constructor()  {
    this.vault = null;
    this.currentDir = [];
    this.getVault();
  }

  async getVault() {
    const chromeStorage = await chrome.storage.sync.get();
    this.vault = chromeStorage.vault || newVault;
    this.currentDir = chromeStorage.currentDir || [];
    this.render();
  }

  getCurrentDir() {
    if (!this.vault) return;
    return this.currentDir.reduce((folder, title) => {
      const nextItem = folder.contents[title];
      if (!nextItem) {
        throw Error(`could not find ${title}`);
      } else if (nextItem.type !== 'folder') {
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
    container.appendChild(
      <DirectoryView contents={dir.contents} />
    );
  }

  async save() {
    if (!this.vault || !this.currentDir) return;
    await chrome.storage.sync.set({
      vault: this.vault,
      currentDir: this.currentDir,
    });
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
    dir.contents[title] = newLink;
    this.saveAndRender();
  }

  addFolder(title: string) {
    const parent = this.currentDir;
    const newFolder: Content<'folder'> = {
      type: 'folder',
      title,
      contents: {},
    };
    console.log({ newFolder, parent })
    const dir = this.getCurrentDir();
    if (!dir) throw Error('dir is null');
    dir.contents[title] = newFolder;
    this.saveAndRender();
  }

  setDir(keys: string[]) {
    this.currentDir = keys;
    this.saveAndRender();
  }
}
