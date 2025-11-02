import { test } from 'vitest';
test('FIX ME');

// FIX ME fix tests
// import { describe, expect, test } from 'vitest';
// import { getItem, getNewVault } from '@/lib/newVault';
// import { addMockItem } from '@/lib/test/addMockItem';
// import {
//   testNewResultFailure,
//   testNewResultSuccess,
// } from '@/lib/test/testResult';
// 
// describe('Get item', async () => {
//   const vault = getNewVault();
//   const { root, path } = vault;
// 
//   test('Get any item', async () => {
//     const { resultPath } = await addMockItem(root, path, 'link', 'link1');
//     testNewResultSuccess(getItem(root, resultPath));
//   });
// 
//   test('Get typed link', async () => {
//     const { resultPath } = await addMockItem(root, path, 'link', 'link1');
//     const item = testNewResultSuccess(getItem(root, resultPath, 'link'));
//     expect(item.type).toBe('link');
//   });
// 
//   test('Get item with wrong type', async () => {
//     const { resultPath } = await addMockItem(root, path, 'link', 'link1');
//     testNewResultFailure(getItem(root, resultPath, 'folder'));
//   });
// 
//   // FIX ME should probably make tests for more combos of item types
//   // for every type, test that it gets the right item for no type and every other type
// });
