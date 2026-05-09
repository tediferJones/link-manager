import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import router from '@/api/routes';
import { clearExpiredTokens } from '@/api/models';
import { useRateLimit } from '@/api/lib';
import { pwaUrl, extUrl } from '@/shared/constants';

// FIX ME verify user account is valid for every request besides signup
// - should probably just create a wrapper like useDb or useJwt
//   - maybe useVerifiedUser

export const app = express();

app.use(cors({
  origin: [ pwaUrl, extUrl ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(useRateLimit);

app.use(express.json());
app.use(cookieParser());
app.use('/', router);

app.listen(8000, () => console.log('Server running on port 8000'));

setInterval(() => clearExpiredTokens(Date.now()), 1000 * 60 * 5);
