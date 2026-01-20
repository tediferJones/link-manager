import { CookieOptions } from 'express';

export const sessionCookieName = 'sessionId';

export const sessionCookieOpts: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/jwt',
}
