import { newUserVault } from '@/app/lib/app/userVault';
import { saveAndRender } from '@/app/lib/newVault/sync';

export async function setPath(keys: string[]) {
  newUserVault.path = keys;
  await saveAndRender();
}
