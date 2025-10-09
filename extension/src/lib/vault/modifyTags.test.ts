import { expect, test } from 'vitest';
import modifyTags from '@/lib/vault/modifyTags';

const testTag = 'newTag';

test('Add tag', () => {
  const result = modifyTags.add([], testTag);
  expect(result).toContain(testTag);
});

test('Delete tag', () => {
  const result = modifyTags.delete([ testTag ], testTag);
  expect(result).not.toContain(testTag);
  expect(result).toHaveLength(0);
});
