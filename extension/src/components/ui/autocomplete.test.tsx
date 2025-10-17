import { beforeEach, describe, expect, test, vi } from 'vitest';
import { Autocomplete } from '@/components/ui';
import { classes } from '@/components/ui/autocomplete';
import getElement from '@/lib/utils/getElement';

describe('Autocomplete', () => {
  const id = 'autocompleteId';
  const containerId = `autocomplete-${id}`;
  
  beforeEach(() => document.body.innerHTML = '');

  test('Hide autocomplete on initial render', () => {
    document.body.appendChild(
      <Autocomplete id={id}
        generator={vi.fn()}
        onSubmit={vi.fn()}
      />
    );
    classes.hide.forEach(className => {
      expect(getElement(`#${containerId}`).className).toContain(className);
    });
  });

  test('Show autocomplete when input is focused', () => {
    document.body.appendChild(
      <Autocomplete id={id}
        generator={() => []}
        onSubmit={vi.fn()}
      />
    );
    const input = getElement<HTMLInputElement>(`#${id}`);
    input.focus();
    classes.show.forEach(className => {
      expect(getElement(`#${containerId}`).className).toContain(className);
    });
  });

  test('Hide autocomplete when input loses focus', () => {
    document.body.appendChild(
      <Autocomplete id={id}
        generator={() => []}
        onSubmit={vi.fn()}
      />
    );
    const input = getElement<HTMLInputElement>(`#${id}`);
    input.focus();
    input.blur();
    classes.hide.forEach(className => {
      expect(getElement(`#${containerId}`).className).toContain(className);
    });
  });

  test('Autocomplete remains visible when focus move inside container', () => {
    document.body.appendChild(
      <Autocomplete id={id}
        generator={() => []}
        onSubmit={vi.fn()}
      />
    );
    const input = getElement<HTMLInputElement>(`#${id}`);
    input.focus();
    const container = getElement<HTMLDivElement>(`#${containerId}`);
    (container.firstElementChild as HTMLDivElement)?.focus();
    classes.show.forEach(className => {
      expect(getElement(`#${containerId}`).className).toContain(className);
    });
  });

  test('Refresh autocomplete results onInput', () => {
    const func = vi.fn();
    document.body.appendChild(
      <Autocomplete id={id}
        generator={() => {
          func();
          return []
        }}
        onSubmit={vi.fn()}
      />
    );
    const input = getElement<HTMLInputElement>(`#${id}`);
    input.focus();
    const event = new Event('input', { bubbles: true, cancelable: true });
    input.dispatchEvent(event);
    expect(func).toHaveBeenCalledTimes(2);
  });

  test('Trigger onSubmit func when submitted', () => {
    const submitFunc = vi.fn();
    document.body.appendChild(
      <Autocomplete id={id}
        generator={() => []}
        onSubmit={submitFunc}
      />
    );
    const input = getElement<HTMLInputElement>(`#${id}`);
    input.focus();
    const event = new Event('submit', { bubbles: true });
    input.dispatchEvent(event);
    expect(submitFunc).toHaveBeenCalledOnce();
  });

  test('Refresh autocomplete results after submit', async () => {
    const generatorFunc = vi.fn();
    const submitFunc = vi.fn();
    document.body.appendChild(
      <Autocomplete id={id}
        generator={() => {
          generatorFunc();
          return []
        }}
        onSubmit={submitFunc}
      />
    );
    const input = getElement<HTMLInputElement>(`#${id}`);
    const form = input.closest('form')!;
    input.focus();
    expect(generatorFunc).toHaveBeenCalledTimes(1);
    const event = new Event('submit', { bubbles: true });
    form.dispatchEvent(event);
    await Promise.resolve();
    expect(submitFunc).toHaveBeenCalledOnce();
    expect(generatorFunc).toHaveBeenCalledTimes(2);
  });

  test('Dispatch autocompleteSubmit event after onSubmit handler runs',
    async () => {
      const generatorFunc = vi.fn();
      const submitFunc = vi.fn();
      const autocompleteSubmitFunc = vi.fn();
      document.body.appendChild(
        <Autocomplete id={id}
          generator={() => {
            generatorFunc();
            return []
          }}
          onSubmit={submitFunc}
        />
      );
      const input = getElement<HTMLInputElement>(`#${id}`);
      const form = input.closest('form')!;
      form.addEventListener('autocompleteSubmit', autocompleteSubmitFunc);
      input.focus();
      expect(generatorFunc).toHaveBeenCalledTimes(1);
      const event = new Event('submit', { bubbles: true });
      form.dispatchEvent(event);
      await Promise.resolve();
      expect(submitFunc).toHaveBeenCalledOnce();
      expect(autocompleteSubmitFunc).toHaveBeenCalledAfter(submitFunc);
    }
  );

  test('Displays results', async () => {
    const results = [ 'item1', 'item2', 'item3' ];
    document.body.appendChild(
      <Autocomplete id={id}
        generator={() => results}
        onSubmit={vi.fn()}
      />
    );
    const input = getElement<HTMLInputElement>(`#${id}`);
    input.focus();
    const container = getElement(`#${containerId}`);
    classes.show.forEach(className => {
      expect(container.className).toContain(className);
    });
    await Promise.resolve();
    results.forEach((result, i) => {
      expect(container.children[i  * 2].textContent).toBe(result);
    });
  });
});
