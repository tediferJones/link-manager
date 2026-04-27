import { apiUrl } from 'shared/constants';
import { validate, inlineValidation } from 'shared/utils/inputValidation';
import getElement from '@/app/lib/utils/getElement';
import { openModal } from '@/app/effects';
import { UserAuthHandlers, UserAuthTypes } from '@/app/types';

const userAuthEmailId = 'userAuthEmail';
const userAuthPwdId = 'userAuthPwd';
const userAuthPwdConfirmId = 'userAuthPwdConfirm';
const userAuthFormId = 'userAuthForm';
const userAuthSubmitBtnId = 'userAuthSubmitBtn';

const emailValidation = inlineValidation('email');
const passwordValidation = inlineValidation('password');

export default function UserAuth({ type }: { type: UserAuthTypes }) {
  // FIX ME how do we want to display submit results to user
  const handlers: UserAuthHandlers = {
    'login': {
      btnText: 'Log in',
      loadingText: 'Logging in...',
      requiredInputs: [ 'email', 'password' ],
      submit: async () => {
        const email = getElement<HTMLInputElement>(`#${userAuthEmailId}`).value;
        const password = getElement<HTMLInputElement>(
          `#${userAuthPwdId}`
        ).value;
        const error = validate({ email, password });
        if (error) return console.log('failed validation', error)
        await fetch(`${apiUrl}/login`, {
          headers: { 'Content-Type': 'application/json' },
          // FIX ME do we need this?
          // credentials: 'include',
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        window.dispatchEvent(new CustomEvent('getJwt', {
          detail: { reload: true }
        }));
      },
    },
    'signup': {
      btnText: 'Sign up',
      loadingText: 'Signing up...',
      requiredInputs: [ 'email', 'password', 'confirmPassword' ],
      submit: async () => {
        const email = getElement<HTMLInputElement>(`#${userAuthEmailId}`).value;
        const password = getElement<HTMLInputElement>(
          `#${userAuthPwdId}`
        ).value;
        const error = validate({ email, password });
        if (error) return console.log('failed validation', error)
        const res = await fetch(`${apiUrl}/signup`, {
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          body: JSON.stringify({ email, password }),
        });
        if (res.ok) {
          console.log('account created, check email')
        } else {
          console.log('failed to create account')
        }
      },
    },
    'reqReset': {
      btnText: 'Reset Password',
      loadingText: 'Resetting Password...',
      requiredInputs: [ 'email' ],
      submit: async () => {
        const email = getElement<HTMLInputElement>(`#${userAuthEmailId}`).value;
        const error = validate({ email });
        if (error) return console.log('failed validation', error);
        const res = await fetch(`${apiUrl}/requestPasswordReset`);
        if (res.ok) {
          console.log('check email for reset link')
        } else {
          console.log('failed to request password reset')
        }
      },
    },
    'reset': {
      btnText: 'Reset Password',
      loadingText: 'Resetting Password...',
      requiredInputs: [ 'password' ],
      submit: async () => {
        const password = getElement<HTMLInputElement>(
          `#${userAuthPwdId}`
        ).value;
        const error = validate({ password });
        if (error) return console.log('failed validation', error)
        const searchParams = new URLSearchParams(window.location.search);
        const token = searchParams.get('token');
        if (!token) throw Error('failed to get reset token');
        const res = await fetch(`${apiUrl}/resetPassword`, {
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          body: JSON.stringify({ password, token }),
        });
        if (res.ok) {
          console.log('password has been reset')
        } else {
          console.log('failed to reset password')
        }
      },
    },
  }

  const requiredInputs = handlers[type].requiredInputs;

  function handleInputChange() {
    const userAuthForm = getElement<HTMLFormElement>(`#${userAuthFormId}`);
    const userAuthSubmitBtn = getElement<HTMLButtonElement>(
      `#${userAuthSubmitBtnId}`
    );
    userAuthSubmitBtn.disabled = !userAuthForm.checkValidity();
  }

  return (
    <form class='grid grid-cols-3 gap-4'
      id={userAuthFormId}
      onSubmit={async (e) => {
        e.preventDefault();
        const submitBtn = getElement<HTMLButtonElement>(
          `#${userAuthSubmitBtnId}`
        );
        submitBtn.textContent = handlers[type].loadingText;
        submitBtn.disabled = true;
        await handlers[type].submit();
        submitBtn.textContent = handlers[type].btnText;
        submitBtn.disabled = false;
      }}
    >
      {requiredInputs.includes('email') && (
        <>
          <label className='m-auto' htmlFor={userAuthEmailId}>E-mail</label>
          <input className='defaultBorder col-span-2'
            type='input' 
            id={userAuthEmailId}
            onInput={handleInputChange}
            {...emailValidation}
          />
        </>
      )}
      {requiredInputs.includes('password') && (
        <>
          <label className='m-auto' htmlFor={userAuthPwdId}>Password</label>
          <input className='defaultBorder col-span-2'
            type='password' 
            id={userAuthPwdId}
            onInput={handleInputChange}
            {...passwordValidation}
          />
        </>
      )}
      {requiredInputs.includes('confirmPassword') && (
        // Do we really need this?  User can always just reset their password if needed
        <>
          <label className='m-auto' htmlFor={userAuthPwdId}>
            Confirm Password
          </label>
          <input className='defaultBorder col-span-2'
            type='password' 
            id={userAuthPwdConfirmId}
            onInput={handleInputChange}
            {...passwordValidation}
          />
        </>
      )}
      {type !== 'reset' && (
        <>
          <hr className='col-span-full' />
          {type !== 'login' && (
            <button className='col-span-full text-center underline'
              onClick={() => openModal(
                handlers['login'].btnText,
                <UserAuth type='login' />
              )}
            >Login</button>
          )}
          {type !== 'signup' && (
            <button className='col-span-full text-center underline'
              onClick={() => openModal(
                handlers['signup'].btnText,
                <UserAuth type='signup' />
              )}
            >Create Account</button>
          )}
          {type !== 'reqReset' && (
            <button className='col-span-full text-center underline'
              type='button'
              onClick={() => openModal(
                handlers['reset'].btnText,
                <UserAuth type='reqReset' />
              )}
            >Forgot Password</button>
          )}
        </>
      )}
      <hr className='col-span-full' />
      <button className='bg-primary text-bg p-2 rounded-lg col-span-full disabled:opacity-50 disabled:!cursor-not-allowed'
        id={userAuthSubmitBtnId}
        type='submit'
        disabled
      >{handlers[type].btnText}</button>
    </form>
  )
}
