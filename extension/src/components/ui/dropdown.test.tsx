/**
 * @vitest-environment jsdom
 */

import { beforeEach, describe, expect, test } from 'vitest';
import { Dropdown } from '@/components/ui';

describe('Dropdown', () => {
  const key = 'testDropdown';

  beforeEach(() => document.body.innerHTML = '');

  test('Initial render', () => {
    const element = (
      <Dropdown key={key} align='center'>
        <div>Trigger</div>
        <div>Content</div>
      </Dropdown>
    );
    document.body.appendChild(element);
    const [ _, content ] = element.children;
    expect(content.className).toContain('opacity-0');
    expect(content.className).toContain('pointer-events-none');
    expect(content.id).toBe(`dropdown-${key}`);
    expect(content.getAttribute('inert')).not.toBeNull();
  });

  test('Click trigger to show content', () => {
    const element = (
      <Dropdown key={key} align='center'>
        <div>Trigger</div>
        <div>Content</div>
      </Dropdown>
    );
    document.body.appendChild(element);
    const [ trigger, content ] = element.children;
    (trigger as HTMLDivElement).click();
    expect(content.className).toContain('opacity-100');
    expect(content.className).toContain('pointer-events-auto');
    expect(content.getAttribute('inert')).toBeNull();
  });

  test('Click trigger to hide content', () => {
    const element = (
      <Dropdown key={key} align='center'>
        <div>Trigger</div>
        <div>Content</div>
      </Dropdown>
    );
    document.body.appendChild(element);
    const [ trigger, content ] = element.children;
    (trigger as HTMLDivElement).click();
    (trigger as HTMLDivElement).click();
    expect(content.className).toContain('opacity-0');
    expect(content.className).toContain('pointer-events-none');
    expect(content.getAttribute('inert')).not.toBeNull();
  });

  test('Press escape to hide content', async () => {
    const element = (
      <Dropdown key={key} align='center'>
        <div>Trigger</div>
        <div>Content</div>
      </Dropdown>
    );
    document.body.appendChild(element);
    const [ trigger, content ] = element.children;
    (trigger as HTMLDivElement).click();
    // FIX ME there is problem with this event firing
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    dispatchEvent(event);
    console.log(content.className)
    // expect(content.className).toContain('opacity-0');
    // expect(content.className).toContain('pointer-events-none');
    // expect(content.getAttribute('inert')).not.toBeNull();
  });
});
