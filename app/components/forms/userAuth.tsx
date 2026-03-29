import getElement from "@/app/lib/utils/getElement";
import { Checkbox } from "@/app/components/ui";

const userAuthEmailId = 'userAuthEmail';
const userAuthPwdId = 'userAuthPassword';
const userAuthCreateAccount = 'userAuthCreateAccount';

export default function UserAuth() {
  return (
    <form class="grid grid-cols-3 gap-4" onSubmit={(e) => {
      e.preventDefault();
      const email = getElement<HTMLInputElement>(`#${userAuthEmailId}`).value;
      const pwd = getElement<HTMLInputElement>(`#${userAuthPwdId}`).value;
      const createAccount = getElement<HTMLInputElement>(
        `#${userAuthCreateAccount}`
      ).checked;
      console.log({ email, pwd, createAccount })
    }}>
      <label className='m-auto' htmlFor={userAuthEmailId}>E-mail</label>
      <input className='defaultBorder col-span-2'
        type='email' 
        id={userAuthEmailId}
        required
      />
      <label className='m-auto' htmlFor={userAuthPwdId}>Password</label>
      <input className='defaultBorder col-span-2'
        type='password' 
        id={userAuthPwdId}
        required
      />
      <div className='col-span-full flex gap-4 justify-center'>
        <label>Create Account</label>
        <Checkbox id={userAuthCreateAccount} />
      </div>
      <button className='bg-primary text-bg p-2 rounded-lg opacity-50 col-span-full'
        type='submit'
      >Login</button>
    </form>
  )
}
