import { expect, test, vi } from 'vitest';
import Vault from '@/lib/Vault';
// import { Content } from '@/types';

// (globalThis as any).chrome = {
//   storage: {
//     get: vi.fn(())
//   }
// }
// 
// const vault = new Vault();

// test('Add item to vault', () => {
//   const testLink: Content<'link'> = {
//     type: 'link',
//     title: 'testLink',
//     href: 'https://example.com',
//     tags: [],
//     pinned: false,
//   }
//   vault.add(testLink, vault.currentDir);
//   expect(vault.vault.contents['testLink']).toBe(testLink);
// })

test('adding', () => {
  expect(1 + 2).toBe(3)
})
