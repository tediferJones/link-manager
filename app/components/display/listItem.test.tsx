import { describe, expect, test } from 'vitest';
import { HTMLElementTagNames, SVGElementTagNames } from 'jsx-dom';
import { ListItem } from '@/app/components/display';
import {
  capitalize,
  decreasePriorityTitle,
  increasePriorityTitle,
  lockFolderTitle,
  toggleWatchedTitle,
} from '@/app/components/display/listItem';
import { mockItem, togglePinned } from '@/app/lib/test/mockItems';
import { Content } from '@/app/types';

// FIX ME move to types file
type TagNames = HTMLElementTagNames | SVGElementTagNames

// FIX ME move to @/app/lib/test
function checkTagType(element: Element, expected: TagNames) {
  expect(element.tagName.toLowerCase()).toBe(expected);
}

function testSettingsButton(element: HTMLButtonElement, item: Content) {
  checkTagType(element, 'button');
  expect(element.title).toContain(capitalize(item.type));
  expect(element.title).toContain(item.title);
}

// FIX ME create a function to test wrapper tag type and wrapper textContent
// FIX ME would be nice to test that button clicks actually trigger navigation
//  - but I guess that would be same as testing Vault.setDir

describe('List item', () => {
  test('Link item', () => {
    const titles = [
      decreasePriorityTitle,
      increasePriorityTitle,
      toggleWatchedTitle,
    ]
    const item = mockItem('link', 'link1');
    const listItem = <ListItem item={item} />;
    const [ wrapper, ...buttons ] = listItem.children;
    checkTagType(wrapper, 'a');
    expect(wrapper.textContent).toBe(item.title);
    titles.forEach((title, i) => {
      checkTagType(buttons[i], 'button');
      expect((buttons[i] as HTMLButtonElement).title).toBe(title);
    });
    const settingsBtn = buttons[buttons.length - 1] as HTMLButtonElement;
    testSettingsButton(settingsBtn, item);
  });

  test('Watched item', () => {
    const item = mockItem('watched', 'watched1');
    const listItem = <ListItem item={item} />;
    const [ wrapper, toggleWatched, settingBtn ] = listItem.children;
    checkTagType(wrapper, 'a');
    expect(wrapper.textContent).toBe(item.title);
    expect(
      (toggleWatched as HTMLButtonElement).title
    ).toBe(toggleWatchedTitle);
    testSettingsButton(settingBtn as HTMLButtonElement, item);
  });

  test('Folder item without encryption', () => {
    const item = mockItem('folder', 'folder1');
    const listItem = <ListItem item={item} />;
    const [ wrapper, settingsBtn ] = listItem.children;
    checkTagType(wrapper, 'button');
    expect(wrapper.textContent).toBe(item.title);
    testSettingsButton(settingsBtn as HTMLButtonElement, item);
  });

  test('Folder item with encryption', () => {
    const item = mockItem('folder', 'decryptedFolder1');
    item.encryption = {} as any;
    const listItem = <ListItem item={item} />;
    const [ wrapper, lockBtn, settingsBtn ] = listItem.children;
    checkTagType(wrapper, 'button');
    expect(wrapper.textContent).toBe(item.title);
    expect((lockBtn as HTMLButtonElement).title).toBe(lockFolderTitle);
    testSettingsButton(settingsBtn as HTMLButtonElement, item);
  });

  test('Encrypted folder item', () => {
    const item = mockItem('encryptedFolder', 'encryptedFolder1');
    const listItem = <ListItem item={item} />;
    const [ wrapper, settingsBtn ] = listItem.children;
    checkTagType(wrapper, 'button');
    expect(wrapper.textContent).toBe(item.title);
    testSettingsButton(settingsBtn as HTMLButtonElement, item);
  });

  test('Pinned item', () => {
    const item = togglePinned(mockItem('link', 'link1'));
    const listItem = <ListItem item={item} />;
    const [ wrapper ] = listItem.children;
    const [ pinIcon, itemIcon ] = wrapper.children;
    checkTagType(pinIcon, 'svg');
    checkTagType(itemIcon, 'svg');
  });
});
