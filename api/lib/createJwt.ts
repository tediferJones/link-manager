import { SignJWT } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function createJwt(userId: number) {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('10m')
    .sign(secret);
}
