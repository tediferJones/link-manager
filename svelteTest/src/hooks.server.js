export async function handle({ event, resolve }) {
  event.locals.answer = 42;
  if (event.url.pathname === '/ping') {
    return new Response('pong');
  }

  return await resolve(event, {
    transformPageChunk: ({ html }) => html.replace(
      '<body',
      '<body style="color: blue"'
    )
  });
}

export async function handleFetch({ event, request, fetch }) {
  const url = new URL(request.url);
  if (url.pathname === '/a') {
    return await fetch('/b');
  }

  return await fetch(request);
}

export async function handleError({ event, error }) {
  console.error(error.stack);

  return {
    message: 'everything is fine',
    code: 'JEREMYBEARIMY',
  }
}
