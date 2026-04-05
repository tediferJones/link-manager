import { Request, Response } from 'express';
import { deleteVaultById, getVaultById, upsertVault } from '@/api/models';
import { useDb, useJwt } from '@/api/lib';

export async function getVault(req: Request, res: Response) {
  return useDb(res, async () => {
    return useJwt(req, res, async ({ userId }) => {
      const vaultRecord = await getVaultById(userId);
      if (!vaultRecord) return res.sendStatus(404);
      return res.json(vaultRecord.vault);
    });
  });
}

// FIX ME add type for body
export async function updateVault(req: Request, res: Response) {
  return useDb(res, async () => {
    return useJwt(req, res, async ({ userId }) => {
      console.log('GOT UPDATE REQUEST', req.body)
      const vault = req.body;
      await upsertVault({ userId, vault });
      return res.json(vault);
    });
  });
}

export async function deleteVault(req: Request, res: Response) {
  return useDb(res, async () => {
    return useJwt(req, res, async ({ userId }) => {
      await deleteVaultById(userId);
      return res.sendStatus(204);
    });
  });
}
