import { Router } from 'express';

const router = Router();

router.post('/signup', (_, res) => {
  res.send('signup route');
});

router.post('/login', (_, res) => {
  res.send('login route');
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
