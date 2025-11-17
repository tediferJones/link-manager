import { eq } from 'drizzle-orm';
import { db, users, UsersInsert } from '@/api/drizzle';

export async function getUserByEmail(email: string) {
  return db.select().from(users).where(eq(users.email, email)).get();
}

export async function getUserById(id: number) {
  return db.select().from(users).where(eq(users.id, id)).get();
}

export async function createUser(user: UsersInsert) {
  return db.insert(users).values(user);
}
