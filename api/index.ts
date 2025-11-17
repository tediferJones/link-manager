import express from 'express';
import cookieParser from 'cookie-parser';
import router from '@/api/routes';

export const app = express();

app.use(express.json());
app.use(cookieParser());
app.use('/', router);

app.listen(8000, () => console.log('Server running on port 8000'));
