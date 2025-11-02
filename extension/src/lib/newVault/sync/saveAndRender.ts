import { render, save } from '@/lib/newVault';

export async function saveAndRender() {
  await save();
  render();
}
