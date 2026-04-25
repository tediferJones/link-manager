import { newUserVault } from '@/app/lib/app/userVault';
import { apiUrl, authHeaderPrefix, wssUrl } from '@/shared/constants';
import { getClientWsHandlers, ServerWsMessage } from 'shared/utils/ws';
import { load } from '@/app/lib/newVault/sync';
import fetchWithJwt from '@/app/lib/utils/fetchWithJwt';
import { UserData } from '@/shared/types';

const executeServerMsg = getClientWsHandlers(load);

export default async function getJwt() {
  const jwtRes = await fetch(`${apiUrl}/jwt`, { credentials: 'include' });
  if (!jwtRes.ok) return;

  const body = await jwtRes.json();
  newUserVault.jwt = `${authHeaderPrefix}${body.jwt}`;
  const userData: UserData = (
    await fetchWithJwt(`${apiUrl}/me`).then(res => res.json())
  );
  newUserVault.userData = userData;

  if (newUserVault.ws) return;
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
