import { beforeEach, vi } from 'vitest';

(globalThis.chrome as any) = {
  storage: {
    sync: {
      set: vi.fn()
    }
  }
}

// Why does jsdom not have these implemented, thanks chatGPT
if (typeof Blob.prototype.stream !== 'function') {
  // Restore Node's native Blob (supports .stream())
  globalThis.Blob = (await import('node:buffer')).Blob as unknown as typeof Blob;
}

if (typeof globalThis.CompressionStream === 'undefined') {
  // Restore Node's native CompressionStream
  globalThis.CompressionStream = (await import('node:zlib') as any).CompressionStream as any;
}

beforeEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = '';
});
