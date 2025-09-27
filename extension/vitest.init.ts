import * as chrome from 'vitest-chrome/lib/index.esm';

Object.assign(global, chrome);

(globalThis as any).dispatchEvent = () => {};
