import { json } from '@sveltejs/kit';

export function GET() {
  const number = Math.floor(Math.random() * 6);

  return json(number)
}
