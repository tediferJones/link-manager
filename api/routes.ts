import { CookieOptions, Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { tryDb, getSessionCookie, createJwt, getAuthHeader, verifyJwt } from '@/api/lib';
import {
  createUser,
  getUserByEmail,
  getUserById,
  createSession,
  getSessionById,
  deleteSession,
  getVaultById,
  upsertVault,
} from '@/api/models';

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
  path: '/jwt',
}

async function getUniqueSessionId(): Promise<string> {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const match = await getSessionById(sessionId);
  return match ? getUniqueSessionId() : sessionId;
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
    await createUser({ email, passwordHash, date: Date.now() });
    return res.sendStatus(201);
  });
});

router.post<{}, any, LoginCredentials>('/login', async (req, res) => {
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
});

router.post('/logout', async (req, res) => {
  return tryDb(res, async () => {
    const sessionId = getSessionCookie(req);
    await deleteSession(sessionId);
    res.clearCookie(sessionCookieName, sessionCookieOpts);
    return res.sendStatus(204);
  });
});

router.get('/jwt', async (req, res) => {
  return tryDb(res, async () => {
    const sessionId = getSessionCookie(req);
    if (!sessionId) return res.sendStatus(401);
    const sessionRecord = await getSessionById(sessionId);
    if (!sessionRecord) return res.sendStatus(401);
    const jwt = createJwt(sessionRecord.userId);
    res.json({ jwt });
  });
});

router.get('/me', async (req, res) => {
  // FIX ME could this be simplified with a join?
  return tryDb(res, async () => {
    const sessionId = getSessionCookie(req);
    if (!sessionId) return res.sendStatus(401);

    const sessionRecord = await getSessionById(sessionId);
    if (!sessionRecord) return res.sendStatus(401);

    const userRecord = await getUserById(sessionRecord.userId);
    if (!userRecord) throw Error('Session is active but user does not exist');

    return res.send({ email: userRecord.email });
  });
});

router.get('/vault', (req, res) => {
  return tryDb(res, async () => {
    const jwt = getAuthHeader(req);
    if (!jwt) return res.status(401).json('No token provided');
    const payload = await verifyJwt(jwt);
    if (!payload || !payload.sub) return res.status(401).json('Invalid token');
    const userId = Number(payload.sub);
    res.json(await getVaultById(userId));
  });
});

// FIX ME
// should this post, put or patch?
// Theortically we are only updating the vault column of the table so patch makes sense
// Post also seems logical
// Put could work because we are entirely overwriting the vault but that still only one column
router.put('/vault', (req, res) => {
  return tryDb(res, async () => {
    const jwt = getAuthHeader(req);
    if (!jwt) return res.status(401).json('No token provided');
    const payload = await verifyJwt(jwt);
    if (!payload) return res.status(401).json('Invalid token');
    const { userId } = payload;
    const vault = req.body;
    await upsertVault({ userId, vault });
    res.json(vault);
  });
});

// FIX ME
// maybe just create a route to delete user's entire account?
router.delete('/vault', (_, res) => {
  res.send('delete user vault');
});

export default router;
