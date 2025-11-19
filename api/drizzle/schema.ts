import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { DbRef } from '@/api/types';

// FIX ME verify "PRAGMA foreign_keys = ON;" in database
// otherwise foreign key relationships will not enforced

const refUserId: DbRef = [ () => users.id, { onDelete: 'cascade' } ];

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('passwordHash').notNull(),
  date: integer('date').notNull(),
});

export const sessions = sqliteTable('sessions', {
  userId: integer('userId').notNull().references(...refUserId),
  date: integer('date').notNull(),
  sessionId: text('sessionId').primaryKey().unique().notNull(),
});

export const vaults = sqliteTable('vaults', {
  userId: integer('userId').unique().notNull().references(...refUserId),
  vault: text('vault').notNull(),
});
