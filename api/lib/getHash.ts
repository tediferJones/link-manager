import bcrypt from 'bcrypt';

export async function getHash(password: string) {
  return await bcrypt.hash(password, 12);
}
