import { decompress } from '@/app/lib/utils/compression';
import { Vault } from '@/app/types';

export default async function extractVault(compressed: string): Promise<Vault> {
  return JSON.parse(await decompress(compressed));
}
