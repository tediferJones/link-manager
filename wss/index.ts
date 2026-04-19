import WebSocket, { WebSocketServer } from 'ws';
import {
  sendServerWsMessage,
  ClientWsMessage,
  getServerWsHandlers
} from 'shared/utils/ws';
import { config } from 'dotenv';

type ClientPools = { [key: number]: Client[] }

type Client = WebSocket & { pool: Client[] }

config({ path: '.env' });

const port = 9000;
const wss = new WebSocketServer({ port });

const clientPools: ClientPools = {}

const executeClientMessage = getServerWsHandlers(clientPools);

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

wss.on('connection', async (ws: Client) => {
  sendServerWsMessage(ws, { action: 'authenticate' });

  ws.on('message', (data) => {
    try {
      const clientMsg: ClientWsMessage = JSON.parse(data.toString());
      executeClientMessage(ws, clientMsg);
    } catch {
      throw Error(`Failed to execute: ${data.toString()}`);
    }
    console.log('Received message', data.toString());
  });

  ws.on('close', () => {
    console.log('client disconnected')
    if (ws.pool) ws.pool = ws.pool.filter(client => client !== ws);
  });
});

console.log(`WebSocket server is running on port ${port}`);
