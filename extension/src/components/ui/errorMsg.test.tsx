/**
 * @vitest-environment jsdom
 */

import { describe, expect, test } from 'vitest';
import ErrorMsg from '@/components/ui/errorMsg';

describe('ErrorMsg', () => {
  const id = 'testId';

  test('Accessible via id', () => {
    const element = <ErrorMsg id={id} />;
    expect(element.id).toBe(`error-${id}`);
  });

  test('No text content on initial render', () => {
    const element = <ErrorMsg id={id} />;
    expect(element.textContent).toBe('');
  });

  test('Hidden on initial render', () => {
    const element = <ErrorMsg id={id} />;
    expect(element.className).toContain('hidden');
  });
});
