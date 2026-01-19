import Mailgun from 'mailgun.js';
import ms from 'ms';
import { getUniqueToken } from '@/api/lib';
import { createToken } from '@/api/models';
import { UsersSelect } from '@/api/types';

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY!,
});

// FIX ME move to shared constants
const apiUrl = 'localhost:8000'

export async function sendConfirmationEmail({ id, email }: UsersSelect) {
  const token = await getUniqueToken();
  await createToken({
    userId: id,
    token,
    type: 'verify',
    expiresAt: Date.now() + ms('15m'),
  });

  try {
    await mg.messages.create('mail.theodrz.me', {
      from: 'LinkMan <linkman@mail.theodrz.me>',
      to: email,
      subject: 'Verify your LinkMan Account',
      text: `Click the link below to verify your account: ${apiUrl}/verify?token=${token}`,
    });
  } catch {
    console.log('Failed to send confirmation email');
  }
}

export async function sendPasswordResetEmail({ id, email }: UsersSelect) {
  const token = await getUniqueToken();
  await createToken({
    userId: id,
    token,
    type: 'reset',
    expiresAt: Date.now() + ms('15m'),
  });

  try {
    await mg.messages.create('mail.theodrz.me', {
      from: 'LinkMan <linkman@mail.theodrz.me>',
      to: email,
      subject: 'Reset your LinkMan Password',
      text: `Click the link below to reset your password: ${apiUrl}/reset?token=${token}`,
    });
  } catch {
    console.log('Failed to send password reset email');
  }
}
