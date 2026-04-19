import { WebSocket as ClientWebSocket } from 'ws';
import { extractJwt } from '@/shared/utils/extractJwt';
import { UserSession } from 'app/types';

type Client = ClientWebSocket & {
  pool?: Client[],
  isAuthenticated?: boolean,
  refreshTimeout?: NodeJS.Timeout,
  expirationTimeout?: NodeJS.Timeout,
}

type ClientPools = { [key: number]: Client[] }

type WsActions = 'reload' | 'authenticate'

// FIX ME
// ClientWsMessage and ServerWsMessage are essentially the same, client just requires jwt
// clientWsHandlers and serverWsHandlers should probably be moved to associated packages
//  - this would allow them to easily form closures for accessing the load function and clientPools
// executeClientMsgHandler and executeServerMsgHandler are essentially the same
// sendServerMessage and sendClientMessage are essentially the same

export type ClientWsMessage<T extends WsActions = WsActions> = {
  action: T,
  jwt: string,
}

export type ServerWsMessage<T extends WsActions = WsActions> = {
  action: T
}

type ServerWsHandlers = {
  [K in WsActions]: (ws: Client, msg: ClientWsMessage<K>) => void
}

type ClientWsHandlers = {
  [K in WsActions]: (userVault: UserSession, msg: ServerWsMessage<K>) => void
}

export function getClientWsHandlers(load: Function) {
  const clientWsHandlers: ClientWsHandlers = {
    authenticate: (userVault, msg) => {
      if (!userVault.ws || !userVault.jwt) return;
      sendClientWsMessage(userVault.ws, {
        action: msg.action,
        jwt: userVault.jwt
      });
    },
    reload: () => load(),
  }

  return function executeServerWsMessage<K extends WsActions>(
    userVault: UserSession,
    msg: ServerWsMessage<K>, 
  ) {
    console.log('processing', msg)
    clientWsHandlers[msg.action](userVault, msg);
  }
}

export function sendClientWsMessage(
  ws: WebSocket | null,
  msg: ClientWsMessage,
) {
  ws?.send(JSON.stringify(msg));
}

function closeClient(ws: Client) {
  if (ws.pool) ws.pool = ws.pool?.filter(client => client !== ws);
  clearTimeout(ws.refreshTimeout);
  clearTimeout(ws.expirationTimeout);
  ws.close();
}

async function authenticateClientWs(
  ws: Client,
  msg: ClientWsMessage,
  pools: ClientPools,
) {
  const payload = await extractJwt(msg.jwt);
  if (!payload) {
    console.log('failed to extract jwt')
    return closeClient(ws);
  }
  const timeToExp = (payload.exp * 1000) - Date.now();
  ws.isAuthenticated = true;
  ws.refreshTimeout = setTimeout(() => {
    sendServerWsMessage(ws, { action: 'authenticate' });
  }, timeToExp - 1000 * 60);
  ws.expirationTimeout = setTimeout(() => closeClient(ws), timeToExp);
  if (!pools[payload.userId]) pools[payload.userId] = [];
  if (pools[payload.userId]!.every(client => client !== ws)) {
    pools[payload.userId]!.push(ws);
  }
  if (!ws.pool) ws.pool = pools[payload.userId]!;
  console.log('validated client ws')
}

async function jwtGuard(
  ws: Client,
  msg: ClientWsMessage,
  pools: ClientPools,
  callback: (ws: Client, msg: ServerWsMessage) => void
) {
  console.log('checking jwt guard')
  if (!ws.isAuthenticated) await authenticateClientWs(ws, msg, pools);
  if (ws.readyState === ws.CLOSING || ws.readyState === ws.CLOSED) return;
  console.log('passed jwt guard')
  return callback(ws, msg);
}

export function getServerWsHandlers(pools: ClientPools) {
  const serverWsHandlers: ServerWsHandlers = {
    authenticate: (ws, msg) => authenticateClientWs(ws, msg, pools),
    reload: (ws, msg) => jwtGuard(
      ws,
      msg,
      pools,
      () => dispatchServerWsMessage(ws, { action: msg.action })
    ),
  }

  return function executeClientWsMessage<K extends WsActions>(
    ws: Client,
    msg: ClientWsMessage<K>,
  ) {
    console.log('processing', msg)
    serverWsHandlers[msg.action](ws, msg);
  }
}

export function dispatchServerWsMessage(ws: Client, msg: ServerWsMessage) {
  const stringified = JSON.stringify(msg);
  console.log('DISPATCHING', ws.pool)
  ws.pool?.filter(client => client !== ws && client.isAuthenticated)
    .forEach(client => client.send(stringified));
}

export function sendServerWsMessage(ws: Client, msg: ServerWsMessage) {
  ws.send(JSON.stringify(msg));
}
