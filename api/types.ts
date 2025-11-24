import { Request } from 'express';
import { ReferenceConfig } from 'drizzle-orm/sqlite-core';
import { tokens, users, vaults } from '@/api/drizzle';

export type DbRef = [ ReferenceConfig['ref'], ReferenceConfig['actions'] ]

export type UsersInsert = typeof users.$inferInsert
export type UsersSelect = typeof users.$inferSelect

export type TokensInsert = typeof tokens.$inferInsert
export type TokensSelect = typeof tokens.$inferSelect

export type VaultsInsert = typeof vaults.$inferInsert
export type VaultsSelect = typeof vaults.$inferSelect

export type Req<T = any, K = any> = Request<{}, {}, T, K>

// FIX ME these should be optional, there is no guarantee that the req.body will actually contain these values
export type LoginCredentials = {
  email: string,
  password: string,
}

export type JwtPayload = { userId: number }

export type AuthTypes = 'session' | 'jwt'

export type AuthMethods = {
  [K in AuthTypes]: (req: Request) => Promise<UsersSelect | undefined>
}
