import { Request, Response } from 'express';
import { JWTPayload } from 'jose';
import { JwtPayload } from 'shared/types';
import { extractJwt } from 'shared/utils';

export async function useJwt(
  req: Request,
  res: Response,
  // FIX ME use optPromise type from app
  callback: (payload: JwtPayload & JWTPayload) => Response | Promise<Response>,
) {
  const payload = await extractJwt(req.headers.authorization);
  if (!payload) return res.sendStatus(401);
  return await callback(payload);
}
