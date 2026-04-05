import { newUserVault } from '@/app/lib/app/userVault';
import { apiUrl, wssUrl } from '@/shared/constants';

export default async function getJwt() {
  const jwtRes = await fetch(`${apiUrl}/jwt`, { credentials: 'include' });
  console.log('jwtRes', jwtRes)
  if (jwtRes.ok) {
    console.log('before', newUserVault)
    const body = await jwtRes.json();
    newUserVault.jwt = body.jwt;
    if (!newUserVault.ws) newUserVault.ws = new WebSocket(wssUrl);
    console.log('after', newUserVault)
  }
}
