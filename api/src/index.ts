import express from 'express';
import router from './routes.js';

export const app = express();

app.use(express.json());
app.use('/', router);

app.listen(8000, () => console.log('Server running on port 8000'));
