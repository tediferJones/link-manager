import { newUserVault } from '@/app/lib/app/userVault';
import { UserAuth } from '@/app/components/forms';
import { openModal } from '@/app/effects';
import { apiUrl } from 'shared/constants';

export default function Auth() {
  return newUserVault.jwt && newUserVault.userData ? (
    <div className='flex flex-col gap-2 text-center'>
      User: {newUserVault.userData.email}
      <hr />
      <button onClick={async () => {
        const res = await fetch(`${apiUrl}/session/logout`, {
          credentials: 'include',
          method: 'POST'
        });
        if (res.ok) {
          newUserVault.jwt = '';
          if (newUserVault.ws) newUserVault.ws.close();
          newUserVault.ws = null;
          delete newUserVault.userData;
          dispatchEvent(
            new CustomEvent('getJwt', { detail: { reload: true, preservePath: true } })
          );
        }
      }}>
        Logout
      </button>
    </div>
  ) : (
    <button onClick={() => openModal('Login', <UserAuth type='login' />)}>
      Login
    </button>
  )
}
