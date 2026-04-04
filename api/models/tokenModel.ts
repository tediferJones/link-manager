import { and, eq } from 'drizzle-orm';
import { db, tokens } from '@/api/drizzle';
import { TokensInsert, TokenTypes } from '@/api/types';

export async function createToken(sessionRec: TokensInsert) {
  return await db.insert(tokens).values(sessionRec);
}

export async function getTokenByValue(token: string) {
  return await db.select().from(tokens).where(
    eq(tokens.token, token)
  ).get();
}

export async function updateToken(token: string, newToken: string) {
  return await db.update(tokens).set({ token: newToken })
    .where(eq(tokens.token, token));
}

export async function deleteToken(token: string, type: TokenTypes) {
  return await db.delete(tokens).where(
    and(
      eq(tokens.token, token),
      eq(tokens.type, type),
    )
  );
}
