import { describe, expect, test } from 'vitest';
import { getSortedKeyType } from '@/lib/newVault/utils';
import { mockItem, togglePinned } from '@/lib/test/mockItems';
import { contentTypes } from '@/types';

describe('getSortedKeyType', () => {
  test('Pinned item', () => {
    const item = togglePinned(mockItem('link', 'link1'), true);
    expect(getSortedKeyType(item)).toBe('pinned');
  });

  test('Encrypted folder', () => {
    const item = mockItem('encryptedFolder', 'encFolder1');
    expect(getSortedKeyType(item)).toBe('folder');
  });

  test('Return own type', () => {
    contentTypes.filter(type => type !== 'encryptedFolder')
      .forEach(type => {
        const item = mockItem(type, `${type}1`);
        expect(getSortedKeyType(item)).toBe(type);
      });
  });
});
