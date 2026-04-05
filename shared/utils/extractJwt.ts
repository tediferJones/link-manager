import { jwtVerify } from 'jose';
import { authHeaderPrefix } from '@/shared/constants';
import { JwtPayload } from '@/shared/types';

// FIX ME replace /api/lib/useJwt with these functions

// const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function extractJwt(authHeader?: string) {
  // FIX ME shouldn't have to re-encode on every request
  // find a way to create an app wide export
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  if (!authHeader?.startsWith(authHeaderPrefix)) return;

  const jwt = authHeader.slice(authHeaderPrefix.length);
  if (!jwt) return;
  
  try {
    const { payload } = await jwtVerify<JwtPayload>(jwt, secret);
    return payload;
  } catch {
    return;
  }
}
