import { eq } from 'drizzle-orm';
import { db, users } from '@/api/drizzle';
import { UsersInsert, UsersSelect } from '@/api/types';

export async function createUser(userRec: UsersInsert) {
  return await db.insert(users).values(userRec).returning().get();
}

export async function getUserByEmail(email: string) {
  return await db.select().from(users).where(eq(users.email, email)).get();
}

export async function getUserById(id: number) {
  return await db.select().from(users).where(eq(users.id, id)).get();
}

export async function updateUserById(userRec: UsersSelect) {
  return await db.update(users).set(userRec).where(eq(users.id, userRec.id));
}
