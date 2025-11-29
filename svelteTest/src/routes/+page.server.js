import * as db from '$lib/server/database.js';
import { fail } from '@sveltejs/kit';

export function load(event) {
  const { cookies } = event;
  const visited = cookies.get('visited');
  cookies.set('visited', 'true', { path: '/' });

  let id = cookies.get('userid');
	if (!id) {
		id = crypto.randomUUID();
		cookies.set('userid', id, { path: '/' });
	}

  return {
    visited: visited === 'true',
		todos: db.getTodos(id),
    message: `the answer is ${event.locals.answer}`
  }
}

export const actions = {
  create: async ({ cookies, request }) => {
    await new Promise((fulfil) => setTimeout(fulfil, 1000));
    const data = await request.formData();
    try {
      db.createTodo(cookies.get('userid'), data.get('description'));
    } catch (error) {
      return fail(422, {
        description: data.get('description'),
        error: error.message
      });
    }
  },
  delete: async ({ cookies, request }) => {
    await new Promise((fulfil) => setTimeout(fulfil, 1000));
    const data = await request.formData();
    db.deleteTodo(cookies.get('userid'), data.get('id'));
  }
}
