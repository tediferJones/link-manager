import { isProd } from '@/shared/constants';
import { CookieOptions } from 'express';

export const sessionCookieName = 'sessionId';

export const sessionCookieOpts: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: 'lax',
  path: '/session',
}
