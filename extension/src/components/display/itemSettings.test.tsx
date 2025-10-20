import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ItemSettings } from '@/components/display';
import { createEncryptedFolder, createLink } from '@/lib/test/mockItems';

// FIX ME would probably be nice to make this test more explicit
//  - make sure editItem, tagEditor and pathEditor exist on non encrypted items
//  - make sure copy and delete are the only element for encrypted items

vi.useFakeTimers();

describe('Item settings', () => {
  const minChildCount = 1;

  beforeEach(() => {
    vi.runAllTimers();
    document.body.innerHTML = '';
  });

  test('Show full item settings for non encrypted items', () => {
    const element = <ItemSettings item={createLink('link1')} />;
    document.body.appendChild(element);
    expect(element.childElementCount).toBeGreaterThan(minChildCount);
  });

  test('Show minimal item settings for encrypted items', () => {
    const element = <ItemSettings item={createEncryptedFolder('link1')} />;
    document.body.appendChild(element);
    expect(element.childElementCount).toBe(minChildCount);
  });
});
