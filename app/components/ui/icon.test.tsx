import { describe, expect, test } from 'vitest';
import { X } from 'lucide';
import { Icon } from '@/app/components/ui';

describe('Icon', () => {
  test('Renders an svg', () => {
    const element = <Icon name={X} />;
    expect(element.tagName.toLowerCase()).toBe('svg');
  });

  test('Applies default flex-shrink class', () => {
    const element = <Icon name={X} />;
    expect(element.getAttribute('class')).toContain('flex-shrink-0');
  });

  test('Applies custom className', () => {
    const className = 'p-4 text-lg';
    const element = <Icon name={X} className={className} />;
    expect(element.getAttribute('class')).toContain(className);
  });
});
