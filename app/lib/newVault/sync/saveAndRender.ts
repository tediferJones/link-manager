import { render, save } from '@/lib/newVault/sync';

export async function saveAndRender() {
  await save();
  render();
}
