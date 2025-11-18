import { jwtVerify } from 'jose';

type JwtPayload = { userId: number }

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function verifyJwt(jwt: string) {
  try {
    const { payload } = await jwtVerify<JwtPayload>(jwt, secret);
    return payload;
  } catch {
    return;
  }
}
