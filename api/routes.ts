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

router.post('/session/logout', logout);
router.get('/session/jwt', jwt);

router.get('/jwt/me', me);
router.post('/jwt/requestPasswordReset', requestPasswordReset);
router.post('/jwt/resetPassword', resetPassword);
router.post('/jwt/recoverAccount', recoverAccount);
router.get('/jwt/vault', getVault);
router.put('/jwt/vault', updateVault);
router.delete('/jwt/vault', deleteVault);

export default router;
