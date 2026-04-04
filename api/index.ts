import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import router from '@/api/routes';
import { pwaUrl } from '@/shared/constants';

export const app = express();

app.use(cors({
  // FIX ME add chrome extension URL
  // chrome will generate a consistent id for the URL once published
  origin: pwaUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use('/', router);

app.listen(8000, () => console.log('Server running on port 8000'));
