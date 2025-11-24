import crypto from 'crypto';
import { getTokenByValue } from '@/api/models';

export async function getUniqueToken(): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const match = await getTokenByValue(token);
  return match ? getUniqueToken() : token;
}
