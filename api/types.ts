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

export type JwtPayload = { userId: number }

export type AuthTypes = 'session' | 'jwt'

export type AuthMethods = {
  [K in AuthTypes]: (req: Request) => Promise<UsersSelect | undefined>
}

export type Body<T> = {
  [K in keyof T]?: T[K] extends object ? Body<T[K]> : T[K]
}

export type LoginCredentials = Body<{
  email: string,
  password: string,
}>

export type PasswordResetReq = Body<{
  email: string
}>

export type PasswordReset = Body<{
  token: string,
  password: string,
}>
