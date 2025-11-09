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
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    element.dispatchEvent(event);
    expect(content.className).toContain('opacity-0');
    expect(content.className).toContain('pointer-events-none');
    expect(content.getAttribute('inert')).not.toBeNull();
  });

  test('Hide content when focus is lost', () => {
    const element = (
      <Dropdown key={key} align='center'>
        <div>Trigger</div>
        <div>Content</div>
      </Dropdown>
    );
    document.body.appendChild(element);
    const [ trigger, content ] = element.children;
    (trigger as HTMLDivElement).click();
    const event = new FocusEvent('blur', { bubbles: true, cancelable: true });
    element.dispatchEvent(event);
    expect(content.className).toContain('opacity-0');
    expect(content.className).toContain('pointer-events-none');
    expect(content.getAttribute('inert')).not.toBeNull();
  });

  test('Keep content visible when focus changes within dropdown', () => {
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
    (content as HTMLDivElement).click();
    expect(content.className).toContain('opacity-100');
    expect(content.className).toContain('pointer-events-auto');
    expect(content.getAttribute('inert')).toBeNull();
  });

  test('')
});
