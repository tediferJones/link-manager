import { describe, expect, test } from 'vitest';
import { compress, decompress } from '@/lib/utils/compression';

describe('Compression', () => {
  const testData = 'Hello World';

  test('Valid compression', async () => {
    const compressed = await compress(testData);
    const decompressed = await decompress(compressed);
    expect(decompressed).toBe(testData);
  });

  test('Compression output type is string', async () => {
    const compressed = await compress(testData);
    expect(compressed).toBeTypeOf('string');
  });

  test('Decompression output type is string', async () => {
    const compressed = await compress(testData);
    const decompressed = await decompress(compressed);
    expect(decompressed).toBeTypeOf('string');
  });

  test('Compression match', async () => {
    const a = await compress(testData);
    const b = await compress(testData);
    expect(a).toBe(b);
  });

  test('Invalid compression', async () => {
    await expect(decompress('!!notbase64!!')).rejects.toThrow();
  });

  test('Empty string', async () => {
    const data = '';
    const compressed = await compress(data);
    const decompressed = await decompress(compressed);
    expect(decompressed).toBe(data);
  });

  test('Binary string', async () => {
    const data = '\x00\x01\x02';
    const compressed = await compress(data);
    const decompressed = await decompress(compressed);
    expect(decompressed).toBe(data);
  });

  test('Unicode string', async () => {
    const data = '🔥 emojis 中文 عربى';
    const compressed = await compress(data);
    const decompressed = await decompress(compressed);
    expect(decompressed).toBe(data);
  });
});
