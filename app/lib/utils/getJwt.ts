import { newUserVault } from '@/app/lib/app/userVault';
import { apiUrl, authHeaderPrefix, wssUrl } from '@/shared/constants';
import { getClientWsHandlers, ServerWsMessage } from 'shared/utils/ws';
import { load } from '@/app/lib/newVault/sync';

const executeServerMsg = getClientWsHandlers(load);

export default async function getJwt() {
  const jwtRes = await fetch(`${apiUrl}/jwt`, { credentials: 'include' });
  console.log('jwtRes', jwtRes)
  if (jwtRes.ok) {
    console.log('before', newUserVault)
    const body = await jwtRes.json();
    newUserVault.jwt = `${authHeaderPrefix}${body.jwt}`;
    if (!newUserVault.ws) { 
      console.log("MAKE NEW WEBSOCKET")
      newUserVault.ws = new WebSocket(wssUrl);
      newUserVault.ws.onmessage = (msg) => {
        if (!newUserVault.ws) throw Error('client websocket does not exist');
        try {
          const serverMsg: ServerWsMessage = JSON.parse(msg.data);
          executeServerMsg(newUserVault, serverMsg);
        } catch {
          throw Error(`Failed to execute: ${msg.data}`);
        }
      }
    }
    console.log('after', newUserVault)
  }
}
