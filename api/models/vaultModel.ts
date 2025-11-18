import { eq } from 'drizzle-orm';
import { db, vaults, VaultsInsert } from '@/api/drizzle';

export async function createVault(vaultRec: VaultsInsert) {
  return await db.insert(vaults).values(vaultRec);
}

export async function getVaultById(userId: number) {
  return await db.select().from(vaults).where(eq(vaults.userId, userId));
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
