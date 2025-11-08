import { describe, expect, test, vi } from 'vitest';
import { DirectoryView } from '@/components/display';
import getElement from '@/lib/utils/getElement';
import { getViewPath } from '@/lib/newVault/utils';
import { mockItem, togglePinned } from '@/lib/test/mockItems';
import { directoryViewId, noContentText, paddingClass } from './directoryView';
import { Content } from '@/types';

const mockDecryptPromptId = 'mockDecryptPrompt';
const testListItemClass = 'testListItem';

vi.mock('@/components/forms', () => ({
  DecryptPrompt: vi.fn(() => <div id={mockDecryptPromptId}></div>),
}));

vi.mock('@/lib/newVault/utils', async () => {
  const actual = await vi.importActual('@/lib/newVault/utils');
  return { ...actual, getViewPath: vi.fn(() => []) };
});

// FIX ME can we mock just listItem but import from @/components/display
vi.mock('@/components/display/listItem', () => ({
  default: ({ item }: { item: Content }) => (
    <div class={testListItemClass}>{item.title}</div>
  )
}));

vi.useFakeTimers();

describe('Directory view', () => {
  test('Display decrypt prompt if item is encrypted', () => {
    const item = mockItem('encryptedFolder', 'encrypted1');
    document.body.appendChild(<DirectoryView item={item} />);
    // FIX ME check that this also displays the folder's title
    expect(getViewPath).toHaveBeenCalled();
    expect(getElement(`#${mockDecryptPromptId}`)).toBeTruthy();
  });

  test('Display "No Contents" if item has no contents', () => {
    const item = mockItem('folder', 'folder1');
    document.body.appendChild(<DirectoryView item={item} />);
    const textContent = getElement(`#${directoryViewId}`).textContent;
    expect(textContent).toContain(noContentText);
  });

  test('Display items in correct order', () => {
    const item = mockItem('folder', 'parentFolder');
    item.contents = {
      'folder1': mockItem('folder', 'folder1'),
      'encFolder1': mockItem('encryptedFolder', 'encFolder1'),
      'link1': mockItem('link', 'link1'),
      'watched1': mockItem('watched', 'watched1'),
      'pinned1': togglePinned(mockItem('folder', 'pinned1')),
    }
    item.sortedKeys = {
      pinned: [ 'pinned1' ],
      folder: [ 'folder1', 'encFolder1' ],
      link: [ 'link1' ],
      watched: [ 'watched1' ],
    }
    document.body.appendChild(<DirectoryView item={item} />);
    const listItems = document.querySelectorAll(`.${testListItemClass}`);
    expect(listItems[0].textContent).toBe('pinned1');
    expect(listItems[1].textContent).toBe('folder1');
    expect(listItems[2].textContent).toBe('encFolder1');
    expect(listItems[3].textContent).toBe('link1');
    expect(listItems[4].textContent).toBe('watched1');
  });

  test('Add scrollbar padding when there is vertical overflow', () => {
    const item = mockItem('folder', 'folder1');
    document.body.appendChild(<DirectoryView item={item} />);
    const container = getElement(`#${directoryViewId}`);
    Object.defineProperty(container, 'scrollHeight', { value: 200 });
    Object.defineProperty(container, 'clientHeight', { value: 100 });
    vi.runAllTimers();
    expect(container.className).toContain(paddingClass);
  });
});
