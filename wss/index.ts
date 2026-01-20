import WebSocket, { WebSocketServer } from 'ws';
import { extractJwt } from 'shared/utils';

type Actions = 'getToken'

type Handlers = { [K in Actions]: Function }

type ClientPools = {
  [key: number]: WebSocket[]
}

const port = 9000;
const wss = new WebSocketServer({ port });

const clientPools: ClientPools = {}

const handlers: Handlers = {
  getToken: () => {}
}

// WSS workflow [All client messages should contain JWT]:
//  Connection:
//  - Client includes JWT as bearer token in request authorization header
//  - WSS unwraps JWT, and uses userId to identify user accounts
//  - Each connections gets added to clientPools as { [userId]: [ ws1, ws2, etc... ] }
//
//  On message:
//  - use JWT to identify user account, send all associated clients a "refresh" message
//    - except the sending client, it is assumed they are already up to date
//
//  Disconnect:
//  - Client sends JWT, and the client ws is removed from clientPools[userId]

wss.on('connection', async (ws, req) => {
  console.log('client connected');
  const payload = await extractJwt(req.headers.authorization);
  if (!payload) return ws.close()
  const { userId } = payload;
  if (clientPools[userId]) {
    clientPools[userId].push(ws);
  } else {
    clientPools[userId] = [ ws ];
  }

  ws.on('message', (data) => {
    try {
      const parsed = JSON.parse(data.toString())
    } catch {
      console.log('Improperly formatted message')
    }
    console.log('Received message', data.toString());
  });

  ws.on('close', () => {
    console.log('client disconnected');
  });

  ws.send(JSON.stringify({ action: 'getToken' }));
});

console.log(`WebSocket server is running on port ${port}`);
