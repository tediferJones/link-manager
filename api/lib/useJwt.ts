import { Request, Response } from 'express';
import { JWTPayload, jwtVerify } from 'jose';
import { authHeaderPrefix } from '@/api/lib';
import { JwtPayload } from '@/api/types';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

async function extractPayload(jwt: string) {
  try {
    const { payload } = await jwtVerify<JwtPayload>(jwt, secret);
    return payload;
  } catch {
    return;
  }
}

export async function useJwt(
  req: Request,
  res: Response,
  // FIX ME use optPromise type from app
  callback: (payload: JwtPayload & JWTPayload) => Response | Promise<Response>,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith(authHeaderPrefix)) return res.sendStatus(401);

  const jwt = authHeader.slice(authHeaderPrefix.length);
  if (!jwt) return res.sendStatus(401);
  
  const payload = await extractPayload(jwt);
  if (!payload) return res.sendStatus(401);
  return await callback(payload);
}
