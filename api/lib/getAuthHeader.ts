import { Request } from 'express';

// FIX ME move to constants
const prefix = 'Bearer '

export function getAuthHeader(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith(prefix)) return;
  return authHeader.slice(prefix.length);
}
