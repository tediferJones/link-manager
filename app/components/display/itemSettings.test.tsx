import { afterEach, describe, expect, test, vi } from 'vitest';
import { ItemSettings } from '@/app/components/display';
import { mockItem } from '@/app/lib/test/mockItems';

// FIX ME would probably be nice to make this test more explicit
//  - make sure editItem, tagEditor and pathEditor exist on non encrypted items
//  - make sure copy and delete are the only element for encrypted items
// FIX ME try to eliminate document.querySelector in tagEditor
//  - After about 30 mins of trying just hit it with the most thorough test of all time:
//    expect(true).toBe(true) and call it day
//    - it's not like these are ever actually going to catch anything

vi.useFakeTimers();

describe('Item settings', () => {
  const minChildCount = 1;

  afterEach(() => vi.runAllTimers());

  test('Show full item settings for non encrypted items', () => {
    const element = <ItemSettings item={mockItem('link', 'link1')} />;
    document.body.appendChild(element);
    expect(element.childElementCount).toBeGreaterThan(minChildCount);
  });

  test('Show minimal item settings for encrypted items', () => {
    const encryptedFolder = mockItem('encryptedFolder', 'encryptedFolder1');
    const element = <ItemSettings item={encryptedFolder} />;
    document.body.appendChild(element);
    expect(element.childElementCount).toBe(minChildCount);
  });
});
