import DirectoryView from '@/components/directoryView';
import getElement from '@/lib/getElement';
import { EncryptedFolder, Folder, Link } from '@/types.ts';

const newVault = {
  title: '',
  contents: []
} satisfies Folder as Folder;

export default class Vault {
  vault: Folder | null;
  currentDir: Folder | EncryptedFolder | null;
  storageKey = 'link-manager';

  constructor()  {
    // const existingVault = chrome.storage.sync.get(this.storageKey);
    // console.log(existingVault)
    this.vault = null;
    this.currentDir = null;
    this.getVault();
  }

  addLink(title: string, href: string) {
    if (!this.currentDir) throw Error('currentDir is null');
    const newLink: Link = { title, href };
    this.currentDir.contents.push(newLink);
    this.saveAndRender();
  }

  addFolder(title: string) {
    if (!this.currentDir) throw Error('currentDir is null');
    const newFolder: Folder = { title, contents: [] };
    this.currentDir.contents.push(newFolder);
    this.saveAndRender();
  }

  render() {
    if (!this.currentDir) throw Error('currentDir is null');
    // const container = document.querySelector('#directoryView');
    // if (!container) throw Error('could not find directoryView');
    const container = getElement('#directoryView');
    console.log('rendering', this)
    container.innerHTML = '';
    container.appendChild(
      <DirectoryView contents={this.currentDir.contents} />
    )
  }

  async save() {
    await chrome.storage.sync.set({
      [this.storageKey]: this.vault
    });
  }

  async saveAndRender() {
    await this.save();
    this.render();
  }

  async getVault() {
    const chromeStorage = await chrome.storage.sync.get();
    const existingVault = chromeStorage[this.storageKey];
    const vault = existingVault || newVault;
    this.vault = vault;
    this.currentDir = vault;
    this.render();
  }
}
