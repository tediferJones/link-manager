import bcrypt from 'bcrypt';

export async function getPasswordHash(password: string) {
  return await bcrypt.hash(password, 12);
}
