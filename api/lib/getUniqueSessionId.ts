import crypto from 'crypto';
import { getSessionById } from '@/api/models';

export async function getUniqueSessionId(): Promise<string> {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const match = await getSessionById(sessionId);
  return match ? getUniqueSessionId() : sessionId;
}
