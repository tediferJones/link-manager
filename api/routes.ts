import { CookieOptions, Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db, sessions } from '@/api/drizzle';
import { tryDb } from '@/api/lib';
import { getUserByEmail, getUserById, createUser } from '@/api/models';

const router = Router();

type LoginCredentials = {
  email?: string,
  password?: string,
}

const sessionCookieName = 'sessionId';
const sessionCookieOpts: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/refreshJwt',
}

// function validateLoginCredentials(creds: LoginCredentials) {
//   return creds.email && creds.password
// }

router.post<{}, any, LoginCredentials>('/signup', async (req, res) => {
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
    await createUser({ email, passwordHash, date: Date.now(), vault: '' });
    return res.sendStatus(201);
  });
});

router.post<{}, any, LoginCredentials>('/login', async (req, res) => {
  return await tryDb(res, async () => {
    let { email, password } = req.body;

    if (!email || !password) return res.sendStatus(400);

    const userRecord = await getUserByEmail(email);

    if (!userRecord) return res.status(401).json('Invalid email or password');

    const passwordMatch = await bcrypt.compare(
      password,
      userRecord.passwordHash
    );

    if (!passwordMatch) return res.status(401).json('Invalid email or password');

    // FIX ME verify that sessionId doesn't already exist before inserting
    // otherwise insertion could throw an error
    const sessionId = crypto.randomBytes(32).toString('hex');

    await db.insert(sessions).values({
      userId: userRecord.id,
      sessionId: sessionId,
      date: Date.now(),
    });

    res.cookie(sessionCookieName, sessionId, sessionCookieOpts);

    return res.sendStatus(201);
  });
});

router.post('/logout', async (req, res) => {
  return tryDb(res, async () => {
    const sessionId = req.cookies[sessionCookieName];
    await db.delete(sessions).where(eq(sessions.sessionId, sessionId));
    res.clearCookie(sessionCookieName, sessionCookieOpts);
    return res.sendStatus(204);
  });
});

router.get('/me', async (req, res) => {
  return tryDb(res, async () => {
    const sessionId = req.cookies[sessionCookieName];
    if (!sessionId) return res.sendStatus(401);

    const sessionRecord = await db.select().from(sessions).where(
      eq(sessions.sessionId, sessionId)
    ).get();
    if (!sessionRecord) return res.sendStatus(401);

    const userRecord = await getUserById(sessionRecord.userId);
    if (!userRecord) throw Error('Session is active but user does not exist');

    return res.send({ email: userRecord.email });
  });
});

router.get('/vault', (_, res) => {
  res.send('get current user\'s vault');
});

// FIX ME
// should this post, put or patch?
// Theortically we are only updating the vault column of the table so patch makes sense
// Post also seems logical
// Put could work because we are entirely overwriting the vault but that still only one column
router.post('/vault', (_, res) => {
  res.send('post new vault');
});

// FIX ME
// maybe just create a route to delete user's entire account?
router.delete('/vault', (_, res) => {
  res.send('delete user vault');
});

export default router;
