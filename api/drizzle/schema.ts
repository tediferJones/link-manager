import {
  integer,
  ReferenceConfig,
  sqliteTable,
  text
} from 'drizzle-orm/sqlite-core';

// FIX ME verify "PRAGMA foreign_keys = ON;" in database
// otherwise foreign key relationships will not enforced

type DbRef = [ ReferenceConfig['ref'], ReferenceConfig['actions'] ]
const refUserId: DbRef = [ () => users.id, { onDelete: 'cascade' } ];

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
  email: text('email').unique().notNull(),
  passwordHash: text('passwordHash').notNull(),
  date: integer('date').notNull(),
});

export type UsersInsert = typeof users.$inferInsert;
export type UsersSelect = typeof users.$inferSelect;

export const sessions = sqliteTable('sessions', {
  userId: integer('userId').notNull().references(...refUserId),
  date: integer('date').notNull(),
  sessionId: text('sessionId').primaryKey().unique().notNull(),
});

export type SessionsInsert = typeof sessions.$inferInsert;
export type SessionsSelect = typeof sessions.$inferSelect;

export const vaults = sqliteTable('vaults', {
  userId: integer('userId').notNull().references(...refUserId),
  vault: text('vault').notNull(),
});

export type VaultsInsert = typeof vaults.$inferInsert;
export type VaultsSelect = typeof vaults.$inferSelect;
