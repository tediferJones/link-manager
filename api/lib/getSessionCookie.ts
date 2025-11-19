import { Request } from 'express';
import { sessionCookieName } from '@/api/lib';

export function getSessionCookie(req: Request) {
  return req.cookies[sessionCookieName];
}
