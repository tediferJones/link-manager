<p>Basic Svelte -> Bindings -> Text inputs</p>

<!--
// Basic Svelte -> Events -> Spreading events
<script lang='ts'>
  import BigRedButton from './BigRedButton.svelte';
  import horn from './horn.mp3';

  const audio = new Audio();
  audio.src = horn;

  function honk() {
    // Doesn't actually work because of SSR
    audio.load();
    audio.play();
    console.log('played')
  }
</script>

<BigRedButton onclick={honk} />

// Basic Svelte -> Events -> Component events
<script>
  import Stepper from './Stepper.svelte';

  let value = $state(0);
</script>

<p>The current value is {value}</p>
<Stepper 
  increment={() => value += 1}
  decrement={() => value -= 1}
/>

// Basic Svelte -> Events -> Capturing
<div
  onkeydown={(e) => alert(`<div> ${e.key}`)}
  onkeydowncapture={(e) => alert(`<div> ${e.key}`)}
  role='presentation'
>
  <input
    onkeydown={(e) => alert(`<input> ${e.key}`)}
    onkeydowncapture={(e) => alert(`<input> ${e.key}`)}
  />
</div>

// Basic Svelte -> Events -> DOM events/Inline handlers
<script lang='ts'>
  let m = $state({ x: 0, y: 0 });
</script>

<div onpointermove={(event) => {
  m.x = event.clientX;
  m.y = event.clientY;
}}>
  The pointer is at {Math.round(m.x)} x {Math.round(m.y)}
</div>

<style>
	div {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		padding: 1rem;
	}
</style>

// Basic Svelte -> Logic -> Await blocks
<script>
  import { roll } from './utils.ts';

  let promise = $state(roll());
</script>

<button onclick={() => promise = roll()}>
  roll the dice
</button>

{#await promise}
  <p>...rolling</p>
{:then number}
  <p>you rolled a {number}!</p>
{:catch error}
  <p style='color: red'>{error.message}</p>
{/await}

{#await promise then number}
  <p>you rolled a {number}!</p>
{/await}

// Basic Svelte -> Logic -> Keyed each blocks
<script>
  import Thing from './Thing.svelte';

  let things = $state([
    { id: 1, name: 'apple' },
    { id: 2, name: 'banana' },
    { id: 3, name: 'carrot' },
    { id: 4, name: 'doughnut' },
    { id: 5, name: 'egg' },
  ]);
</script>

<button onclick={() => things.shift()}>
  Remove first thing
</button>

{#each things as thing (thing.id)}
  <Thing name={thing.name} />
{/each}

// Basic Svelte -> Logic -> Each blocks
<script>
	const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
	let selected = $state(colors[0]);
</script>

<h1 style="color: {selected}">Pick a colour</h1>

<div>
  {#each colors as color, i (color)}
    <button
      style='background: {color}'
      aria-label={color}
      aria-current={selected === color}
      onclick={() => selected = color}
    >{i + 1}</button>
  {/each}
</div>

<style>
	h1 {
		font-size: 2rem;
		font-weight: 700;
		transition: color 0.2s;
	}

	div {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		grid-gap: 5px;
		max-width: 400px;
	}

	button {
		aspect-ratio: 1;
		border-radius: 50%;
		background: var(--color, #fff);
		transform: translate(-2px,-2px);
		filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.2));
		transition: all 0.1s;
		color: black;
		font-weight: 700;
		font-size: 2rem;
	}

	button[aria-current="true"] {
		transform: none;
		filter: none;
		box-shadow: inset 3px 3px 4px rgba(0,0,0,0.2);
	}
</style>

// Basic Svelte -> Logic -> If blocks/Else blocks/Else-if blocks
<script>
  let count = $state(0);

  function increment() {
    count += 1;
  }
</script>

<button onclick={increment}>
  Clicked {count}
  {count === 1 ? 'time' : 'times'}
</button>

{#if count > 10}
  <p>{count} is greater than 10</p>
{:else if count < 5}
  <p>{count} is less than 5</p>
{:else}
  <p>{count} is between 5 and 10</p>
{/if}

// Basic Svelte -> Props -> Spread props
<script>
  import PackageInfo from './PackageInfo.svelte';

  const pkg = {
    name: 'svelte',
    version: 5,
    description: 'blazing fast',
    website: 'https://svelte.dev',
  }
</script>

<PackageInfo {...pkg} />

// Basic Svelte -> Props -> Declaring props/Default values
<script>
  import Nested from './Nested.svelte';
</script>

<Nested answer={42} />
<Nested />

// Basic Svelte -> Reactivity -> Universal Reactivity
<script>
	import Counter from './Counter.svelte';
</script>

<Counter />
<Counter />
<Counter />

// Basic Svelte -> Reactivity -> Effects
<script>
  let elapsed = $state(0);
  let interval = $state(1000);

  $effect(() => {
    const id = setInterval(() => {
      elapsed += 1;
    }, interval);

    return () => {
      clearInterval(id);
    }
  });
</script>

<button onclick={() => interval /= 2}>speed up</button>
<button onclick={() => interval *= 2}>slow down</button>

<p>elapsed: {elapsed}</p>

// Basic Svelte -> Reactivity -> Deep state/Derived state/Inspecting state
<script>
  let numbers = $state([1, 2, 3, 4]);
  let total = $derived(numbers.reduce((t, n) => t + n, 0));
  function addNumber() {
    numbers.push(numbers.length + 1);
    console.log($state.snapshot(numbers))
  }
  $inspect(numbers).with(console.trace);
</script>

<p>{numbers.join(' + ')} = {total}</p>

<button onclick={addNumber}>
  Add a number
</button>

// Basic Svelte -> Reactivity -> State
<script>
	let count = $state(0);

	function increment() {
    count++
	}
</script>

<button onclick={increment} class='p-4 bg-blue-500'>
	Clicked {count}
	{count === 1 ? 'time' : 'times'}
</button>
<button onclick={() => count--}>
  Dincrement {count}
	{count === 1 ? 'time' : 'times'}
</button>
-->
