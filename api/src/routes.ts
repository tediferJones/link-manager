import { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { db } from './db/index.js';
import { sessions, users } from './db/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

type LoginCredentials = {
  email?: string,
  password?: string,
}

// function validateLoginCredentials(creds: LoginCredentials) {
//   return creds.email && creds.password
// }

router.post<{}, any, LoginCredentials>('/signup', async (req, res) => {
  let { email, password } = req.body;

  // FIX ME
  // validate email is a valid email and password is valid (min length, has some special chars, etc..)
  // should also send confirmation/validation email to address, only actually add the account once confirmed
  if (!email || !password) return res.sendStatus(400);

  email = email.trim().toLowerCase();

  const emailAlreadyExists = await db.select().from(users).where(
    eq(users.email, email)
  ).get();
  if (emailAlreadyExists) return res.sendStatus(409);

  const passwordHash = await bcrypt.hash(password, 12);

  await db.insert(users).values({
    email,
    passwordHash,
    date: Date.now(),
    vault: '',
  });

  res.sendStatus(201);
});

router.post<{}, any, LoginCredentials>('/login', async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) return res.sendStatus(400);

  const userRecord = await db.select().from(users).where(
    eq(users.email, email)
  ).get();

  if (!userRecord) return res.status(401).json('Invalid email or password');

  const passwordMatch = await bcrypt.compare(
    password,
    userRecord.passwordHash
  );

  if (!passwordMatch) return res.status(401).json('Invalid email or password');

  const sessionToken = crypto.randomBytes(32).toString('hex');

  await db.insert(sessions).values({
    id: userRecord.id,
    token: sessionToken,
    date: Date.now(),
  });

  res.cookie('sessionToken', sessionToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/refresh',
  });

  res.sendStatus(201);
});

router.post('/logout', (_, res) => {
  res.send('logout route');
});

router.get('/me', (_, res) => {
  res.send('get logged in user info');
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
