import { Request } from 'express';
import { ReferenceConfig } from 'drizzle-orm/sqlite-core';
import { sessions, users, vaults } from '@/api/drizzle';

export type DbRef = [ ReferenceConfig['ref'], ReferenceConfig['actions'] ]

export type UsersInsert = typeof users.$inferInsert
export type UsersSelect = typeof users.$inferSelect

export type SessionsInsert = typeof sessions.$inferInsert
export type SessionsSelect = typeof sessions.$inferSelect

export type VaultsInsert = typeof vaults.$inferInsert
export type VaultsSelect = typeof vaults.$inferSelect

export type Req<T> = Request<{}, {}, T>

export type LoginCredentials = {
  email?: string,
  password?: string,
}

export type JwtPayload = { userId: number }

export type AuthTypes = 'session' | 'jwt'

export type AuthMethods = {
  [K in AuthTypes]: (req: Request) => Promise<UsersSelect | undefined>
}
