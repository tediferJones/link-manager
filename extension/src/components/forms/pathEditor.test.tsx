import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PathEditor } from '@/components/forms';
import {
  autocompleteId,
  blurredPlaceholder,
  breadcrumbsId,
  focusedPlaceholder,
} from '@/components/forms/pathEditor';
import getElement from '@/lib/utils/getElement';
import { createLink } from '@/lib/test/mockItems';

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

describe('Path editor', () => {
  const testPath = [ 'seg1', 'seg2' ];

  beforeEach(() => document.body.innerHTML = '');

  test('Displays correct path', () => {
    document.body.appendChild(
      <PathEditor item={createLink('link1')} path={testPath} />
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
      <PathEditor item={createLink('link1')} path={testPath.slice(0, splitIndex)} />
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
      <PathEditor item={createLink('link1')} path={testPath} />
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
        <PathEditor item={createLink('link1')} path={testPath} />
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

  test('Displays correct placeholder when focused', () => {
    document.body.appendChild(
      <PathEditor item={createLink('link1')} path={testPath} />
    );
    const pathInput = getElement<HTMLInputElement>(`#${autocompleteId}`);
    pathInput.focus();
    expect(pathInput.placeholder).toBe(focusedPlaceholder);
  });

  test('Displays correct placeholder when not focused', () => {
    document.body.appendChild(
      <PathEditor item={createLink('link1')} path={testPath} />
    );
    const pathInput = getElement<HTMLInputElement>(`#${autocompleteId}`);
    expect(pathInput.placeholder).toBe(blurredPlaceholder);
  });
});
