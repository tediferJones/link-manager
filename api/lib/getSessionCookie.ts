import { Request } from 'express';

// FIX ME move to constants
const sessionCookieName = 'sessionId';

export function getSessionCookie(req: Request) {
  return req.cookies[sessionCookieName];
}
