import { getNewRoot } from '@/lib/newVault/utils';
import { Vault } from '@/types';

// FIX ME write tests

export function getNewVault(): Vault {
  return {
    root: getNewRoot(),
    path: [] as string[],
    date: Date.now(),
    // FIX ME use package.json version
    version: '0.0.0',
  }
}
