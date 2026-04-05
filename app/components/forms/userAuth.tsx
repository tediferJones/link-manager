import getElement from '@/app/lib/utils/getElement';
import { Checkbox } from '@/app/components/ui';
import { apiUrl } from 'shared/constants';
import { validate, inlineValidation } from 'shared/utils/inputValidation';

const userAuthEmailId = 'userAuthEmail';
const userAuthPwdId = 'userAuthPassword';
const userAuthCreateAccount = 'userAuthCreateAccount';
const userAuthFormId = 'userAuthForm';
const userAuthSubmitBtnId = 'userAuthSubmitBtn';
const userAuthSignUpText = 'Sign Up';
const userAuthLoginText = 'Login';

const emailValidation = inlineValidation('email');
const passwordValidation = inlineValidation('password');

export default function UserAuth() {
  function handleInputChange() {
    const userAuthForm = getElement<HTMLFormElement>(`#${userAuthFormId}`);
    const createAccount = getElement<HTMLInputElement>(
      `#${userAuthCreateAccount}`
    ).checked;
    const userAuthSubmitBtn = getElement<
      HTMLButtonElement
    >(`#${userAuthSubmitBtnId}`);
    userAuthSubmitBtn.disabled = !userAuthForm.checkValidity();
    userAuthSubmitBtn.textContent = (
      createAccount ? userAuthSignUpText : userAuthLoginText
    );
  }

  return (
    <form class='grid grid-cols-3 gap-4'
      id={userAuthFormId}
      onSubmit={async (e) => {
        e.preventDefault();
        const email = getElement<HTMLInputElement>(`#${userAuthEmailId}`).value;
        const password = getElement<HTMLInputElement>(`#${userAuthPwdId}`).value;
        const error = validate({ email, password });
        if (error) return console.log('failed validation', error)
        const createAccount = getElement<HTMLInputElement>(
          `#${userAuthCreateAccount}`
        ).checked;
        if (createAccount) {
          const res = await fetch(`${apiUrl}/signup`, {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({ email, password })
          });
          // FIX ME surface create account result to user
          if (res.ok) {
            console.log('account created, check email')
          } else {
            console.log('failed to create account')
          }
        } else {
          await fetch(`${apiUrl}/login`, {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({ email, password }),
            credentials: 'include'
          });
          window.dispatchEvent(new CustomEvent('getJwt', {
            detail: { reload: true }
          }));
          // FIX ME surface login result to user
          // if successfull, close login window and get jwt
        }
      }}>
      <label className='m-auto' htmlFor={userAuthEmailId}>E-mail</label>
      <input className='defaultBorder col-span-2'
        type='input' 
        id={userAuthEmailId}
        onInput={handleInputChange}
        {...emailValidation}
      />
      <label className='m-auto' htmlFor={userAuthPwdId}>Password</label>
      <input className='defaultBorder col-span-2'
        type='password' 
        id={userAuthPwdId}
        onInput={handleInputChange}
        {...passwordValidation}
      />
      <div className='col-span-full flex gap-4 justify-center'>
        <label>Create Account</label>
        <Checkbox id={userAuthCreateAccount} onChange={handleInputChange} />
      </div>
      <button className='bg-primary text-bg p-2 rounded-lg col-span-full disabled:opacity-50 disabled:!cursor-not-allowed'
        id={userAuthSubmitBtnId}
        type='submit'
        disabled
      >{userAuthLoginText}</button>
    </form>
  )
}
