export type PayloadExtras = { userId: number }

export type JwtPayload = PayloadExtras & { exp: number }

export type UserData = {
  userId: number,
  email: string,
  verified: boolean,
  createdAt: number,
}
