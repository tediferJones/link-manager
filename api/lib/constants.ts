import { CookieOptions } from 'express';

export const sessionCookieName = 'sessionId';

export const sessionCookieOpts: CookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
  path: '/session',
}
