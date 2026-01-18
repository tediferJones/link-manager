import { describe, expect, test } from 'vitest';
import { Loading } from '@/components/ui';

describe('Loading', () => {
  test('Icon spins', () => {
    const element = <Loading />;
    const [ _, spinner ] = element.children;
    expect(spinner.getAttribute('class')).toContain('animate-spin');
  });

  test('Use default loading text', () => {
    const element = <Loading />;
    const [ loadingText ] = element.children;
    expect(loadingText.textContent).toBe('Loading');
  });

  test('Use custom loading text', () => {
    const customLoadingText = 'Please wait';
    const element = <Loading loadingText={customLoadingText} />;
    const [ loadingText ] = element.children;
    expect(loadingText.textContent).toBe(customLoadingText);
  });
});
