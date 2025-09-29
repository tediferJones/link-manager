import { expect, test } from 'vitest';
import asyncReduce from '@/lib/asyncReduce';

const arr = Array(5).fill(0).map((_, i) => i);
const func = (total: number, num: number) => total + num;

function asyncNumber(num: number): Promise<number> {
  return new Promise((resolve) => setTimeout(() => resolve(num)));
}

test('Sync reduce', async () => {
  const result = await asyncReduce(arr, (total, num) => total + num, 0);
  expect(result).toBe(arr.reduce(func, 0));
});

test('Async reduce', async () => {
  const result = await asyncReduce(arr, async (total, num) => {
    return total + await asyncNumber(num);
  }, 0);
  expect(result).toBe(arr.reduce(func, 0));
});
