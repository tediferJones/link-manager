import { newUserVault } from '@/app/lib/app/userVault';
import { authHeaderPrefix } from '@/shared/constants';

export default function fetchWithJwt(
  url: string,
  options?: Parameters<typeof fetch>[1]
) {
  const { headers, ...rest } = options || {};
  console.log('newUserVault from fetchWithJwt', newUserVault)
  console.log('auth header', `${authHeaderPrefix}${newUserVault.jwt}`)
  return fetch(url, {
    headers: {
      authorization: newUserVault.jwt,
      ...headers,
    },
    ...rest,
  });
}
