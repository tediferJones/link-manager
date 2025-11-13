import express from 'express';

const app = express();

app.get('/', (_, res) => {
  res.send('This is the api')
});

app.get('/vault', (_, res) => {
  res.send('Return vault')
});

app.listen(8000, () => console.log('Server running on port 8000'));
