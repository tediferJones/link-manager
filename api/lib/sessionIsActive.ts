import { Request } from 'express';
import { getSessionById } from '@/api/models';
import { getSessionCookie } from '@/api/lib';

// FIX ME delete if not used
export async function sessionIsActive(req: Request) {
  const sessionId = getSessionCookie(req);
  return !!(await getSessionById(sessionId));
}
