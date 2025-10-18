import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PathEditor } from '@/components/forms';
import { autocompleteId, breadcrumbsId } from '@/components/forms/pathEditor';
import getElement from '@/lib/utils/getElement';
import { Content } from '@/types';

vi.mock('@/lib/app/userVault', () => ({
  default: {
    path: [],
    get: vi.fn(() => ({
      throw: vi.fn(() => ({
        data: vi.fn(() => ({
          contents: {}
        }))
      }))
    }))
  }
}));

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

describe('Path editor', () => {
  beforeEach(() => document.body.innerHTML = '');
  const testPath = [ 'seg1', 'seg2' ];

  test('Displays correct path', () => {
    document.body.appendChild(
      <PathEditor item={getTestItem()} path={testPath} />
    );
    // FIX ME extract this getBreadcrumbs stuff to a function since it's repeated in almost every test
    const breadcrumbs = getElement(`#${breadcrumbsId}`).firstElementChild!;
    const segments = [ ...breadcrumbs.children ].reduce((segments, element) => {
      if (!element.textContent) return segments;
      return segments.concat(element.textContent);
    }, [] as string[]);
    expect(segments).toEqual(testPath);
  });

  test('Updates path on autocomplete submit', () => {
    const splitIndex = 1;
    document.body.appendChild(
      <PathEditor item={getTestItem()} path={testPath.slice(0, splitIndex)} />
    );
    const pathInput = getElement<HTMLInputElement>(`#${autocompleteId}`);
    pathInput.value = testPath[splitIndex];
    const event = new Event('submit', { bubbles: true, cancelable: true });
    pathInput.dispatchEvent(event);
    const breadcrumbs = getElement(`#${breadcrumbsId}`).firstElementChild!;
    const segments = [ ...breadcrumbs.children ].reduce((segments, element) => {
      if (!element.textContent) return segments;
      return segments.concat(element.textContent);
    }, [] as string[]);
    expect(segments).toEqual(testPath);
  });

  test('Remove last path segment on backspace if input is empty', () => {
    document.body.appendChild(
      <PathEditor item={getTestItem()} path={testPath} />
    );
    const pathInput = getElement<HTMLInputElement>(`#${autocompleteId}`);
    const event = new KeyboardEvent('keydown', { key: 'Backspace' });
    pathInput.dispatchEvent(event);
    const breadcrumbs = getElement(`#${breadcrumbsId}`).firstElementChild!;
    const segments = [ ...breadcrumbs.children ].reduce((segments, element) => {
      if (!element.textContent) return segments;
      return segments.concat(element.textContent);
    }, [] as string[]);
    expect(segments).toEqual(testPath.slice(0, -1));
  });

  test('Do not remove last path segment on backspace if input has a value',
    () => {
      document.body.appendChild(
        <PathEditor item={getTestItem()} path={testPath} />
      );
      const pathInput = getElement<HTMLInputElement>(`#${autocompleteId}`);
      pathInput.value = 'someValue';
      const event = new KeyboardEvent('keydown', { key: 'Backspace' });
      pathInput.dispatchEvent(event);
      const breadcrumbs = getElement(`#${breadcrumbsId}`).firstElementChild!;
      const segments = [ ...breadcrumbs.children ].reduce((segments, element) => {
        if (!element.textContent) return segments;
        return segments.concat(element.textContent);
      }, [] as string[]);
      expect(segments).toEqual(testPath);
    }
  );

  // FIX ME test if placeholder text changes if focused or not
});
