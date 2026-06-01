import { CookieOptions } from 'express';

export const sessionCookieName = 'sessionId';

export const sessionCookieOpts: CookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
  // FIX ME ideally path should include ONLY routes that actually need the cookie
  // Potential fix, add a prefix segment depending on auth requirement
  // All paths that use cookie for auth start with /session/...
  // All paths that use jwt for auth start with /jwt/...
  // Then we can scope path to /session
  path: '/',
}
