<script lang='ts'>
  import { message } from '$lib/message.js';
  import { fly, slide } from 'svelte/transition';
  import { enhance } from '$app/forms';
  import { browser } from '$app/environment';

  let { data, form } = $props();

  let creating = $state(false);
  let deleting = $state([] as string[]);

  let number = $state();

  async function roll() {
    const response = await fetch('/roll');
    number = await response.json();
  }

  let count = $state(0);

  function increment() {
    count += 1;
  }
</script>

<p class='border-red-500 border-2 rounded-lg p-2'>
  Advanced SvelteKit -> Advanced loading -> Universal load functions
</p>

<h1>home</h1>
<p>this is the home page.</p>
<h1>Hello {data.visited ? 'friend' : 'stranger'}!</h1>
<p>{message}</p>

<h1>todos</h1>

{#if form?.error}
  <p class='error'>{form.error}</p>
{/if}

<form method='POST'
  action='?/create'
  use:enhance={() => {
    creating = true;

    return async ({ update }) => {
      await update();
      creating = false;
    }
  }}
>
  <label>
    add a todo:
    <input 
      disabled={creating}
      name='description'
      value={form?.description ?? ''}
      autocomplete='off'
      required
    />
  </label>
</form>

<div class="centered">
	<h1>todos</h1>

	<ul class="todos">
		{#each data.todos.filter(todo => !deleting.includes(todo.id)) as todo (todo.id)}
			<li in:fly={{ y: 20 }} out:slide>
        <form method='POST'
          action='?/delete'
          use:enhance={() => {
            deleting = [ ...deleting, todo.id ];
            return async ({ update }) => {
              await update();
              deleting = deleting.filter(id => id !== todo.id)
            }
          }}
        >
          <input type='hidden' name='id' value={todo.id}>
          <span>{todo.description}</span>
          <button aria-label='Mark as complete'>X</button>
        </form>
			</li>
		{/each}
	</ul>

  {#if creating}
    <span class='saving'>saving...</span>
  {/if}
</div>

<button onclick={roll}>Roll the dice</button>

{#if number !== undefined}
  <p>You rolled a {number}</p>
{/if}

<div class="centered">
	<h1>todos</h1>

	<label>
		add a todo:
		<input
			type="text"
			autocomplete="off"
			onkeydown={async (e) => {
				if (e.key !== 'Enter') return;

				const input = e.currentTarget;
				const description = input.value;
				
				// TODO handle submit

        const response = await fetch('/todo', {
          method: 'POST',
          body: JSON.stringify({ description }),
          headers: {
            'Content-Type': 'application/json'
          }
        })

        const { id } = await response.json();

        const todos = [ ...data.todos, {
          id, description
        }];

        data = { ...data, todos }

				input.value = '';
			}}
		/>
	</label>

	<ul class="todos">
		{#each data.todos as todo (todo.id)}
			<li>
				<label>
					<input
						type="checkbox"
						checked={todo.done}
						onchange={async (e) => {
							const done = e.currentTarget.checked;

							// TODO handle change
              await fetch(`/todo/${todo.id}`, {
                method: 'PUT',
                body: JSON.stringify({ done }),
                headers: {
                  'Content-Type': 'application/json'
                }
              })
						}}
					/>
					<span>{todo.description}</span>
					<button
						aria-label="Mark as complete"
						onclick={async (e) => {
							// TODO handle delete
              await fetch(`/todo/${todo.id}`, {
                method: 'DELETE'
              });

              const todos = data.todos.filter((t) => t !== todo);
              data = { ...data, todos }
						}}
					></button>
				</label>
			</li>
		{/each}
	</ul>
</div>

<h1>Rendered {browser ? 'in the browser' : 'on the server'}</h1>

<button onclick={increment}>
  Clicks: {count}
</button>
