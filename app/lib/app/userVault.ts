import { getNewVault } from '@/app/lib/newVault/utils';
import { UserSession } from '@/app/types';

// FIX ME rename to userSession
export let newUserVault: UserSession = {
  ...getNewVault(),
  jwt: '',
  ws: null,
}
