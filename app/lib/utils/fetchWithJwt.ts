import { newUserVault } from '@/app/lib/app/userVault';

export default function fetchWithJwt(
  url: string,
  options?: Parameters<typeof fetch>[1]
) {
  const { headers, ...rest } = options || {};
  return fetch(url, {
    headers: {
      authorization: newUserVault.jwt,
      ...headers,
    },
    ...rest,
  });
}
