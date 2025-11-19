import { Request } from 'express';
import { jwtVerify } from 'jose';
import { authHeaderPrefix, getSessionCookie } from '@/api/lib';
import { getSessionById, getUserById } from '@/api/models';
import { AuthMethods, AuthTypes, JwtPayload } from '@/api/types';

// FIX ME
// can we minimize database lookups by using joins?
// i.e. when we check for existing session that one request could also return the user data from the users table?
//
// ideally we to return all associated data from sessions, users, and vaults tables with a single request
// should be able to be done with either a sessionId or userId

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

function getAuthHeader(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith(authHeaderPrefix)) return;
  return authHeader.slice(authHeaderPrefix.length);
}

async function verifyJwt(jwt: string) {
  try {
    const { payload } = await jwtVerify<JwtPayload>(jwt, secret);
    return payload;
  } catch {
    return;
  }
}

export async function getUser(type: AuthTypes, req: Request) {
  const authMethods: AuthMethods = {
    session: async (req) => {
      const sessionId = getSessionCookie(req);
      if (!sessionId) return;
      const sessionRecord = await getSessionById(sessionId);
      if (!sessionRecord) return;
      const userRecord = await getUserById(sessionRecord.userId);
      if (!userRecord) throw Error('Session is active but user does not exist');
      return userRecord;
    },
    jwt: async (req) => {
      const jwt = getAuthHeader(req);
      if (!jwt) return;
      const payload = await verifyJwt(jwt);
      if (!payload) return;
      const userRecord = await getUserById(payload.userId);
      if (!userRecord) throw Error('Session is active but user does not exist');
      return userRecord;
    },
  }
  return authMethods[type](req);
}
