import { beforeEach, describe, expect, test } from 'vitest';
import { TagEditor } from '@/app/components/forms';
import { tagContainerId } from '@/app/components/forms/tagEditor';
import getElement from '@/app/lib/utils/getElement';
import { Content } from '@/app/types';

// FIX ME write more tests

// FIX ME extract to it's own file, gets reused in pathEditor
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
  const testTags = [ 'testTag1', 'testTag2', 'testTag3' ];

  beforeEach(() => document.body.innerHTML = '');

  test('Display No Tags if tags array is empty', () => {
    document.body.appendChild(<TagEditor item={getTestItem()} />);
    expect(getElement(`#${tagContainerId}`).textContent).toBe('No Tags');
  });

  test('Displays tags in the correct order', () => {
    const testItem = getTestItem();
    testItem.tags = testTags;
    document.body.appendChild(<TagEditor item={testItem} />);
    const tagElements = getElement(`#${tagContainerId}`).children;
    [ ...tagElements ].forEach((tag, i) => {
      expect(tag.textContent).toBe(testTags[i]);
    });
  });

  test('Updates tags when submitted', () => {
    const splitIndex = 1;
    const testItem = getTestItem();
    testItem.tags = testTags.slice(0, splitIndex);
    document.body.appendChild(<TagEditor item={testItem} />);
    const tagContainer = getElement(`#${tagContainerId}`);
    testItem.tags = testItem.tags.concat(testTags.slice(splitIndex));
    const event = new Event('submit', { bubbles: true, cancelable: true });
    tagContainer.dispatchEvent(event);
    const tagElements = tagContainer.children;
    [ ...tagElements ].forEach((tag, i) => {
      expect(tag.textContent).toBe(testTags[i]);
    });
  });
});
