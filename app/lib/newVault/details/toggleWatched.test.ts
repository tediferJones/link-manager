import { describe, expect, test } from 'vitest';
import { toggleWatched } from '@/lib/newVault/details';
import { getNewVault } from '@/lib/newVault/utils';
import { addMockItem } from '@/lib/test/addMockItem';
import { testNewResultSuccess } from '@/lib/test/testResult';

describe('Set watched', () => {
  test('Toggle link to watched', async () => {
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(root, path, 'link', 'link1');
    const setWatchedResult = await toggleWatched(root, resultPath);
    const watched = testNewResultSuccess(setWatchedResult);
    expect(watched.type).toBe('watched');
    expect('watched' in watched).toBe(true);
  });

  test('Toggle watched to link', async () => {
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(root, path, 'watched', 'watched1');
    const link = testNewResultSuccess(await toggleWatched(root, resultPath));
    expect(link.type).toBe('link');
    expect('watched' in link).toBe(false);
  });

  test('Force change link to watched', async () => {
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(root, path, 'link', 'link1');
    const forceWatched = testNewResultSuccess(
      await toggleWatched(root, resultPath, true)
    );
    expect(forceWatched.type).toBe('watched');
    expect('watched' in forceWatched).toBe(true);
  });

  test('Force change watched to link', async () => {
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(root, path, 'watched', 'watched1');
    const forceLink = testNewResultSuccess(
      await toggleWatched(root, resultPath, false)
    );
    expect(forceLink.type).toBe('link');
    expect('watched' in forceLink).toBe(false);
  });

  test('Force link to link', async () => {
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(root, path, 'link', 'link1');
    const link = testNewResultSuccess(
      await toggleWatched(root, resultPath, false)
    );
    expect(link.type).toBe('link');
    expect('watched' in link).toBe(false);
  });

  test('Force watched to watched', async () => {
    const { root, path } = getNewVault();
    const { resultPath } = await addMockItem(root, path, 'watched', 'watched1');
    const watched = testNewResultSuccess(
      await toggleWatched(root, resultPath, true)
    );
    expect(watched.type).toBe('watched');
    expect('watched' in watched).toBe(true);
  });
});
