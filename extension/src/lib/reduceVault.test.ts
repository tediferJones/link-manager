import { expect, test } from 'bun:test';
import reduceVault from '@/lib/reduceVault';
import type { Vault } from '@/types';

test('reduce without locked folders', async () => {
  const result = await reduceVault({
    contents: {
      'linkName': {
        url: 'this is the link',
        viewed: false
      }
    }
  } satisfies Vault)

  expect(result).toEqual({
      contents: {
        'linkName': {
          url: 'this is the link',
          viewed: false
        }
      }
    });
});

test('reduce with locked folders', async () => {
  const result = await reduceVault({
    contents: {
      'linkName': {
        url: 'this is the link',
        viewed: false
      },
      'lockedFolder': {
        locked: {
          data: 'encrypted data',
          iv: 'someRandomBase64',
          salt: 'moreRandomBase64'
        },
        contents: {
          'linkName2': {
            url: 'this is the link #2',
            viewed: false
          },
        }
      }
    }
  } satisfies Vault)

  expect(result).toEqual({
    contents: {
      'linkName': {
        url: 'this is the link',
        viewed: false
      },
      'lockedFolder': {
        locked: {
          data: 'encrypted data',
          iv: 'someRandomBase64',
          salt: 'moreRandomBase64'
        },
      } as Vault
    }
  })
})
