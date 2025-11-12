import pkg from '@/package.json';
import { getNewRoot } from '@/app/lib/newVault/utils';
import { Vault } from '@/app/types';

// FIX ME write tests

export function getNewVault(): Vault {
  return {
    root: getNewRoot(),
    path: [] as string[],
    date: Date.now(),
    version: pkg.version,
  }
}
