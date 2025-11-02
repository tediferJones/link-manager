import { test } from 'vitest';
test('test');

// FIX ME fix tests
// import { describe, expect, test } from 'vitest';
// import { getNewVault, unwrap } from '@/lib/newVault';
// import { addMockItem } from '@/lib/test/addMockItem';
// import {
//   testNewResultFailure,
//   testNewResultSuccess,
// } from '@/lib/test/testResult';
// 
// describe('Add item', () => {
//   const vault = getNewVault();
//   const { root, path } = vault;
// 
//   test('Add item to vault', async () => {
//     const { result } = await addMockItem(root, path, 'link', 'link1');
//     const item = unwrap(result);
//     expect(vault.root.contents[item.title]).toBe(item);
//     expect(vault.root.sortedKeys.link).toContain(item.title);
//   });
// 
//   test('Fail to add duplicate', async () => {
//     const { result: result1 } = await addMockItem(root, path, 'link', 'link1');
//     testNewResultSuccess(result1);
//     const { result: result2 } = await addMockItem(root, path, 'link', 'link1');
//     testNewResultFailure(result2);
//   });
// });
