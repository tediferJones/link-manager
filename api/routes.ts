import { Router } from 'express';
import {
  deleteVault,
  getVault,
  jwt,
  login,
  logout,
  me,
  recoverAccount,
  requestPasswordReset,
  resetPassword,
  signup,
  updateVault,
  verify,
} from '@/api/controllers';

const router = Router();

router.post('/signup', signup);
router.get('/verify', verify);
router.post('/login', login);
router.post('/logout', logout);
router.get('/jwt', jwt);
router.get('/me', me);
router.post('/requestPasswordReset', requestPasswordReset);
router.post('/resetPassword', resetPassword);
router.post('/recoverAccount', recoverAccount);

router.get('/vault', getVault);
router.put('/vault', updateVault);
router.delete('/vault', deleteVault);

// import FormData from 'form-data';
// import Mailgun from 'mailgun.js';
// // FIX ME delete once we get verification emails working
// router.get('/emailTest', async (req, res) => {
//   const mailgun = new Mailgun(FormData);
//   const mg = mailgun.client({
//     username: 'api',
//     key: process.env.MAILGUN_API_KEY!,
//   });
// 
//   const email = req.query.email;
//   if (!email) return res.sendStatus(400);
// 
//   try {
//     const data = await mg.messages.create('mail.theodrz.me', {
//       from: 'LinkMan <postmaster@mail.theodrz.me>',
//       to: [ email.toString() ],
//       subject: 'Verify your LinkMan Account',
//       text: 'Add account verification link here',
//     });
// 
//     console.log(email, data); // logs response data
//   } catch (error) {
//     console.log(error); //logs any error
//   }
// 
//   return res.send('Email test');
// });

export default router;
