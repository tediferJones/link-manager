import { eq } from 'drizzle-orm';
import { db, sessions } from '@/api/drizzle';
import { SessionsInsert } from '@/api/types';

export async function createSession(sessionRec: SessionsInsert) {
  return await db.insert(sessions).values(sessionRec);
}

export async function getSessionById(sessionId: string) {
  return await db.select().from(sessions).where(
    eq(sessions.sessionId, sessionId)
  ).get();
}

export async function deleteSession(sessionId: string) {
  return await db.delete(sessions).where(eq(sessions.sessionId, sessionId));
}
