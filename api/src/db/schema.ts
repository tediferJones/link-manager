import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('passwordHash').notNull(),
  date: integer('date').notNull(),
  vault: text('vault').notNull(),
});

export type UsersInsert = typeof users.$inferInsert;
export type UsersSelect = typeof users.$inferSelect;

export const sessions = sqliteTable('sessions', {
  id: integer('id').notNull(),
  date: integer('date').notNull(),
  token: text('token').primaryKey().unique().notNull(),
});

export type SessionsInsert = typeof sessions.$inferInsert;
export type SessionsSelect = typeof sessions.$inferSelect;
