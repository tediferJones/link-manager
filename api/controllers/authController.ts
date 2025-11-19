import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import {
  createSession,
  createUser,
  deleteSession,
  getUserByEmail,
} from '@/api/models';
import {
  createJwt,
  getSessionCookie,
  getUniqueSessionId,
  getUser,
  sessionCookieName,
  sessionCookieOpts,
  tryDb,
} from '@/api/lib';
import { LoginCredentials, Req } from '@/api/types';

export async function signup(req: Req<LoginCredentials>, res: Response) {
  return await tryDb(res, async () => {
    let { email, password } = req.body;

    // FIX ME
    // validate email is a valid email and password is valid (min length, has some special chars, etc..)
    // should also send confirmation/validation email to address, only actually add the account once confirmed
    if (!email || !password) return res.sendStatus(400);

    email = email.trim().toLowerCase();

    const emailAlreadyExists = await getUserByEmail(email);
    if (emailAlreadyExists) return res.sendStatus(409);

    const passwordHash = await bcrypt.hash(password, 12);
    await createUser({ email, passwordHash, date: Date.now() });
    return res.sendStatus(201);
  });
}

export async function login(req: Req<LoginCredentials>, res: Response) {
  return await tryDb(res, async () => {
    const loginFailMsg = 'Invalid email or password';
    // FIX ME if email is normalized on signup it needs to be normalized on login too
    let { email, password } = req.body;

    if (!email || !password) return res.sendStatus(400);

    const userRecord = await getUserByEmail(email);

    if (!userRecord) return res.status(401).json(loginFailMsg);

    const passwordMatch = await bcrypt.compare(
      password,
      userRecord.passwordHash
    );

    if (!passwordMatch) return res.status(401).json(loginFailMsg);

    const sessionId = await getUniqueSessionId();
    await createSession({
      userId: userRecord.id,
      sessionId,
      date: Date.now(),
    });
    res.cookie(sessionCookieName, sessionId, sessionCookieOpts);

    return res.sendStatus(201);
  });
}

export async function logout(req: Request, res: Response) {
  return tryDb(res, async () => {
    const sessionId = getSessionCookie(req);
    await deleteSession(sessionId);
    res.clearCookie(sessionCookieName, sessionCookieOpts);
    return res.sendStatus(204);
  });
}

export async function me(req: Request, res: Response) {
  return tryDb(res, async () => {
    const user = await getUser('session', req);
    if (!user) return res.sendStatus(401);
    return res.send({ email: user.email });
  });
}

export async function jwt(req: Request, res: Response) {
  return tryDb(res, async () => {
    const user = await getUser('session', req);
    if (!user) return res.sendStatus(401);
    res.json({ jwt: await createJwt(user.id) });
  });
}
