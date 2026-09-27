import { isProd } from '@/shared/constants';
import { CookieOptions } from 'express';

export const sessionCookieName = 'sessionId';

export const sessionCookieOpts: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/session',
}
