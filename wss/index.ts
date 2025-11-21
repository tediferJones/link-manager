import { WebSocketServer } from 'ws';

const port = 9000;
const wss = new WebSocketServer({ port });

wss.on('connection', (socket) => {
  console.log('client connected');

  socket.on('message', (data) => {
    console.log('Received message', data.toString());
  });

  socket.on('close', () => {
    console.log('client disconnected');
  });

  socket.send('hello world');
});

console.log(`WebSocket server is running on port ${port}`);
