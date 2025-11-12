import { render, save } from '@/app/lib/newVault/sync';

export async function saveAndRender() {
  await save();
  render();
}
