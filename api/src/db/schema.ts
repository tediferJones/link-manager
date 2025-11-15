import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  email: text('email').notNull(),
  passwordHash: text('passwordHash').notNull(),
  passwordSalt: text('passwordSalt').notNull(),
  date: integer('date').notNull(),
  vault: text('vault').notNull(),
});

export type UsersInsert = typeof users.$inferInsert;
export type UsersSelect = typeof users.$inferSelect;
