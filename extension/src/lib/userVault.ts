import Vault from '@/lib/Vault';

const UserVault = new Vault();
// FIX ME, for debug purposes only
(window as any).vault = UserVault;

export default UserVault;
