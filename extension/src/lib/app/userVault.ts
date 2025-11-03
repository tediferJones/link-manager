import Vault from '@/lib/vault/Vault';
import { getNewVault } from '@/lib/newVault/utils';

const UserVault = new Vault();
// FIX ME, for debug purposes only
(window as any).vault = UserVault;

export default UserVault;

const newUserVault = getNewVault();
(window as any).newVault = newUserVault;
export { newUserVault };
