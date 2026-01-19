import { beforeEach, describe, expect, test } from 'vitest';
import { ErrorMsg } from '@/app/components/ui';
import { hideError, showError } from '@/app/effects';

const id = 'testId';
const errorMsg = 'This is an error message';

describe('showError', () => {
  beforeEach(() => document.body.innerHTML = '');

  test('Add textContent', () => {
    const element = <ErrorMsg id={id} />;
    document.body.appendChild(element);
    showError(id, errorMsg);
    expect(element.textContent).toBe(errorMsg);
  });

  test('Remove hidden class', () => {
    const element = <ErrorMsg id={id} />;
    document.body.appendChild(element);
    showError(id, errorMsg);
    expect(element.className).not.toContain('hidden');
  });
});

describe('hideError', () => {
  beforeEach(() => document.body.innerHTML = '');

  test('Remove textContent', () => {
    const element = <ErrorMsg id={id} />;
    document.body.appendChild(element);
    showError(id, errorMsg);
    hideError(id);
    expect(element.textContent).toBe('');
  });

  test('Add hidden class', () => {
    const element = <ErrorMsg id={id} />;
    document.body.appendChild(element);
    showError(id, errorMsg);
    hideError(id);
    expect(element.className).toContain('hidden');
  });
});
