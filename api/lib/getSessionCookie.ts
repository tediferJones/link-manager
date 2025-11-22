import { Request } from 'express';
import { sessionCookieName } from '@/api/lib';

export function getSessionCookie(req: Request): string | undefined {
  return req.cookies[sessionCookieName];
}
