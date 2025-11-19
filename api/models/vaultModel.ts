import { eq } from 'drizzle-orm';
import { db, vaults } from '@/api/drizzle';
import { VaultsInsert } from '@/api/types';

export async function createVault(vaultRec: VaultsInsert) {
  return await db.insert(vaults).values(vaultRec);
}

export async function getVaultById(userId: number) {
  return await db.select().from(vaults).where(eq(vaults.userId, userId)).get();
}

export async function upsertVault(vaultRec: VaultsInsert) {
  return await db.insert(vaults).values(vaultRec).onConflictDoUpdate({
    target: vaults.userId,
    set: vaultRec,
  });
}

export async function deleteVaultById(userId: number) {
  return await db.delete(vaults).where(eq(vaults.userId, userId));
}
