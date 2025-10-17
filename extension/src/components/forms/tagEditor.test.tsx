import { beforeEach, describe, expect, test } from 'vitest';
import { TagEditor } from '@/components/forms';
import { tagContainerId } from '@/components/forms/tagEditor';
import getElement from '@/lib/utils/getElement';
import { Content } from '@/types';

// FIX ME write more tests

function getTestItem() {
  return {
    type: 'link',
    title: 'link1',
    href: 'https://example.com',
    pinned: false,
    tags: [] as string[],
    date: Date.now(),
  } satisfies Content<'link'>
}

describe('Tag editor', () => {
  beforeEach(() => document.body.innerHTML = '');

  test('Display No Tags if tags array is empty', () => {
    document.body.appendChild(<TagEditor item={getTestItem()} />);
    expect(getElement(`#${tagContainerId}`).textContent).toBe('No Tags');
  });

  test('Displays tags in the correct order', () => {
    const testItem = getTestItem();
    const testTags = [ 'testTag1', 'testTag2', 'testTag3' ];
    testItem.tags = testTags;
    document.body.appendChild(<TagEditor item={testItem} />);
    const tagElements = getElement(`#${tagContainerId}`).children;
    [ ...tagElements ].forEach((tag, i) => {
      expect(tag.textContent).toBe(testTags[i]);
    });
  });
});
