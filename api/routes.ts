import { Router } from 'express';
import {
  deleteVault,
  getVault,
  jwt,
  login,
  logout,
  me,
  signup,
  updateVault,
} from '@/api/controllers';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);
router.get('/jwt', jwt);
router.get('/me', me);

router.get('/vault', getVault);
router.put('/vault', updateVault);
router.delete('/vault', deleteVault);

export default router;
