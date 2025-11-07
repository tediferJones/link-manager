import { newUserVault } from '@/lib/app/userVault';
import { saveAndRender } from '@/lib/newVault/sync';

export async function setPath(keys: string[]) {
  newUserVault.path = keys;
  await saveAndRender();
}
