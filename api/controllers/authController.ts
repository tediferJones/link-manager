import { Request, Response } from 'express';
import { SignJWT } from 'jose';
import bcrypt from 'bcrypt';
import ms from 'ms';
import { validate } from 'shared/utils'
import {
  createToken,
  createUser,
  deleteToken,
  getTokenByValue,
  getUserByEmail,
  getUserById,
  updateToken,
  updateUserById,
} from '@/api/models';
import {
  getPasswordHash,
  getSessionCookie,
  getUniqueToken,
  normalize,
  sendConfirmationEmail,
  sendPasswordResetEmail,
  sessionCookieName,
  sessionCookieOpts,
  useDb,
  useJwt,
} from '@/api/lib';
import { LoginCredentials, PasswordReset, PasswordResetReq, Req } from '@/api/types';

// FIX ME this file is getting too big, break it up into individual functions

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function signup(req: Req<LoginCredentials>, res: Response) {
  return await useDb(res, async () => {
    let { email, password } = req.body;
    if (!email) return res.status(400).json('Email is required');
    if (!password) return res.status(400).json('Password is required');
    email = normalize(email);

    // FIX ME
    // should also send confirmation/validation email to address, only actually add the account once confirmed
    const error = validate({ email, password });
    if (error) return res.status(400).json(error);

    const emailAlreadyExists = await getUserByEmail(email);
    if (emailAlreadyExists) return res.sendStatus(409);

    const userRec = await createUser({
      email,
      passwordHash: await getPasswordHash(password),
      createdAt: Date.now(),
      verified: false,
    });
    await sendConfirmationEmail(userRec);
    return res.status(201).json('Verify email address');
  });
}

export async function verify(req: Req<never, { token?: string }>, res: Response) {
  return await useDb(res, async () => {
    const { token } = req.query;
    if (!token) return res.status(400).json('Token query parameter is required');
    const tokenRec = await getTokenByValue(token);
    if (!tokenRec || tokenRec.type !== 'verify') {
      return res.status(400).json('Token is invalid');
    }
    const userRec = await getUserById(tokenRec.userId);
    if (!userRec) {
      throw Error('token is valid but user does not exist');
    }
    userRec.verified = true;
    await updateUserById(userRec);
    await deleteToken(tokenRec.token, tokenRec.type)
    // FIX ME should probably redirect to pwa/extension
    return res.sendStatus(200).json('Your account has been activated, you can close this window');
  });
}

export async function login(req: Req<LoginCredentials>, res: Response) {
  // FIX ME
  // what if verification token has expired?
  // we need to figure out some way for users to re-send verification emails
  return await useDb(res, async () => {
    const loginFailMsg = 'Invalid email or password';
    let { email, password } = req.body;
    if (!email) return res.status(400).json('Email is required');
    if (!password) return res.status(400).json('Password is required');
    email = normalize(email);

    const error = validate({ email, password });
    if (error) return res.status(400).json(error);

    const userRecord = await getUserByEmail(email);
    if (!userRecord) return res.status(401).json(loginFailMsg);
    if (!userRecord.verified) {
      return res.status(403).json('Your account has not been verified');
    }

    const passwordMatch = await bcrypt.compare(
      password,
      userRecord.passwordHash
    );

    if (!passwordMatch) return res.status(401).json(loginFailMsg);

    const token = await getUniqueToken();
    await createToken({
      userId: userRecord.id,
      token,
      expiresAt: Date.now() + ms('99y'),
      type: 'session',
    });
    res.cookie(sessionCookieName, token, sessionCookieOpts);

    return res.sendStatus(201);
  });
}

export async function logout(req: Request, res: Response) {
  return useDb(res, async () => {
    const sessionId = getSessionCookie(req);
    if (sessionId) {
      await deleteToken(sessionId, 'session');
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
    const sessionRec = await getTokenByValue(sessionId);
    if (!sessionRec) return res.status(401).json('Session is no longer valid');
    if (sessionRec.type !== 'session') {
      return res.status(401).json('Token is not a session token');
    }

    const userRec = await getUserById(sessionRec.userId);
    if (!userRec) return res.status(401).json('User does not exist');
    if (!userRec.verified) return res.status(401).json('Not verified');

    const newToken = await getUniqueToken();
    await updateToken(sessionId, newToken);

    const jwt = await new SignJWT({ userId: sessionRec.userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('10m')
      .sign(secret);

    res.cookie(sessionCookieName, newToken, sessionCookieOpts);
    return res.json({ jwt });
  });
}

export async function requestPasswordReset(req: Req<PasswordResetReq>, res: Response) {
  return useDb(res, async () => {
    const { email } = req.body;
    if (!email) return res.status(400).json('Email is required');
    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json('Email not found');
    await sendPasswordResetEmail(user);
    return res.status(200).json(
      'A link to reset your password has been sent to your email address'
    );
  });
}

export async function resetPassword(req: Req<PasswordReset>, res: Response) {
  return useDb(res, async () => {
    const { token, password } = req.body;
    if (!token) return res.status(400).json('Token is required');
    if (!password) return res.status(400).json('Password is required')
    const tokenRec = await getTokenByValue(token);
    if (!tokenRec || tokenRec.type !== 'reset') {
      return res.status(400).json('Token is invalid');
    }
    const userRec = await getUserById(tokenRec.userId);
    if (!userRec) {
      throw Error('token is valid but user does not exist');
    }
    userRec.passwordHash = await getPasswordHash(password);
    await updateUserById(userRec);
    return res.sendStatus(200).json('Your password has been changed');
  });
}
