import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { DbRef, tokenTypes } from '@/api/types';

// FIX ME verify "PRAGMA foreign_keys = ON;" in database
// otherwise foreign key relationships will not enforced

const refUserId: DbRef = [ () => users.id, { onDelete: 'cascade' } ];

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('passwordHash').notNull(),
  createdAt: integer('createdAt').notNull(),
  verified: integer({ mode: 'boolean' }).notNull(),
});

export const tokens = sqliteTable('tokens', {
  userId: integer('userId').notNull().references(...refUserId),
  expiresAt: integer('expiresAt').notNull(),
  token: text('token').primaryKey().unique().notNull(),
  type: text('type', { enum: tokenTypes }).notNull(),
});

export const vaults = sqliteTable('vaults', {
  userId: integer('userId').unique().notNull().references(...refUserId),
  vault: text('vault').notNull(),
});
