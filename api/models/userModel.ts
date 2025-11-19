import { eq } from 'drizzle-orm';
import { db, users } from '@/api/drizzle';
import { UsersInsert } from '@/api/types';

export async function createUser(userRec: UsersInsert) {
  return db.insert(users).values(userRec);
}

export async function getUserByEmail(email: string) {
  return db.select().from(users).where(eq(users.email, email)).get();
}

export async function getUserById(id: number) {
  return db.select().from(users).where(eq(users.id, id)).get();
}
