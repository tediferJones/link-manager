import { Request, Response } from 'express';
import { SignJWT } from 'jose';
import bcrypt from 'bcrypt';
import {
  createSession,
  createUser,
  deleteSession,
  getSessionById,
  getUserByEmail,
  getUserById,
  updateSession,
} from '@/api/models';
import {
  getSessionCookie,
  getUniqueSessionId,
  normalize,
  sessionCookieName,
  sessionCookieOpts,
  useDb,
  useJwt,
  validate,
} from '@/api/lib';
import { LoginCredentials, Req } from '@/api/types';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function signup(req: Req<LoginCredentials>, res: Response) {
  return await useDb(res, async () => {
    let { email, password } = req.body;
    email = normalize(email);

    // FIX ME
    // should also send confirmation/validation email to address, only actually add the account once confirmed
    const error = validate({ email, password });
    if (error) return res.status(400).json(error);

    const emailAlreadyExists = await getUserByEmail(email);
    if (emailAlreadyExists) return res.sendStatus(409);

    const passwordHash = await bcrypt.hash(password, 12);
    await createUser({
      email,
      passwordHash,
      date: Date.now(),
      verified: false,
    });
    return res.sendStatus(201);
  });
}

export async function login(req: Req<LoginCredentials>, res: Response) {
  return await useDb(res, async () => {
    const loginFailMsg = 'Invalid email or password';
    let { email, password } = req.body;
    email = normalize(email);

    const error = validate({ email, password });
    if (error) return res.status(400).json(error);

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
  return useDb(res, async () => {
    const sessionId = getSessionCookie(req);
    if (sessionId) {
      await deleteSession(sessionId);
      res.clearCookie(sessionCookieName, sessionCookieOpts);
    }
    return res.sendStatus(204);
  });
}

export async function me(req: Request, res: Response) {
  return useDb(res, async () => {
    return useJwt(req, res, async ({ userId }) => {
      const userRec = await getUserById(userId);
      if (!userRec) return res.sendStatus(404);
      return res.send({ email: userRec.email });
    });
  });
}

export async function jwt(req: Request, res: Response) {
  return useDb(res, async () => {
    const sessionId = getSessionCookie(req);
    if (!sessionId) return res.status(401).json('No session cookie found');
    const sessionRec = await getSessionById(sessionId);
    if (!sessionRec) return res.status(401).json('Session is no longer valid');

    const userRec = await getUserById(sessionRec.userId);
    if (!userRec) return res.status(401).json('User does not exist');
    if (!userRec.verified) return res.status(401).json('Not verified');

    await updateSession(sessionId, await getUniqueSessionId());

    const jwt = await new SignJWT({ userId: sessionRec.userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('10m')
      .sign(secret);

    return res.json({ jwt });
  });
}
