import { Request, Response } from 'express';
import { getVaultById, upsertVault } from '@/api/models';
import { getUser, tryDb } from '@/api/lib';

export async function getVault(req: Request, res: Response) {
  return tryDb(res, async () => {
    const user = await getUser('jwt', req);
    if (!user) return res.sendStatus(401);
    const vaultRecord = await getVaultById(user.id);
    if (!vaultRecord) return res.sendStatus(404);
    res.json(vaultRecord.vault);
  });
}

export async function updateVault(req: Request, res: Response) {
  return tryDb(res, async () => {
    const user = await getUser('jwt', req);
    if (!user) return res.sendStatus(401);
    const vault = req.body;
    await upsertVault({ userId: user.id, vault });
    res.json(vault);
  });
}

// FIX ME create usable route or delete
export async function deleteVault(_: Request, res: Response) {
  res.send('delete vault')
}
