<p>Advanved Svelte -> Special elements -> svelte:window tag thing</p>

<!--
// Advanved Svelte -> Context API -> setContext and getContext
<script lang='ts'>
	import Canvas from './CanvasV2.svelte';
	import Square from './Square.svelte';

	// we use a seeded random number generator to get consistent jitter
	let seed = 1;

	function random() {
		seed *= 16807;
		seed %= 2147483647;
		return (seed - 1) / 2147483646;
	}

	function jitter(amount: number) {
		return amount * (random() - 0.5);
	}
</script>

<div class="container">
	<Canvas width={800} height={1200}>
		{#each Array(12) as _, c (c)}
			{#each Array(22) as _, r (r)}
				<Square
					x={180 + c * 40}
					y={180 + r * 40}
					size={40}
          rotate={jitter(r * 0.05)}
				/>
			{/each}
		{/each}
	</Canvas>
</div>

<style>
	.container {
		height: 100%;
		aspect-ratio: 2 / 3;
		margin: 0 auto;
		background: rgb(224, 219, 213);
		filter: drop-shadow(0.5em 0.5em 1em rgba(0, 0, 0, 0.1));
	}
</style>

// Advanved Svelte -> Advanced transitions -> Deferred transitions/Animations
<script lang='ts'>
	import TodoList from './TodoList.svelte';

	const todos = $state([
		{ id: 1, done: false, description: 'write some docs' },
		{ id: 2, done: false, description: 'start writing blog post' },
		{ id: 3, done: true, description: 'buy some milk' },
		{ id: 4, done: false, description: 'mow the lawn' },
		{ id: 5, done: false, description: 'feed the turtle' },
		{ id: 6, done: false, description: 'fix some bugs' }
	]);

	let uid = todos.length + 1;

	function remove(todo: typeof todos[number]) {
		const index = todos.indexOf(todo);
		todos.splice(index, 1);
	}
</script>

<div class="board">
	<input
		placeholder="what needs to be done?"
		onkeydown={(e) => {
			if (e.key !== 'Enter') return;

			todos.push({
				id: uid++,
				done: false,
				description: e.currentTarget.value
			});

			e.currentTarget.value = '';
		}}
	/>

	<div class="todo">
		<h2>todo</h2>
		<TodoList todos={todos.filter((t) => !t.done)} {remove} />
	</div>

	<div class="done">
		<h2>done</h2>
		<TodoList todos={todos.filter((t) => t.done)} {remove} />
	</div>
</div>

<style>
	.board {
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-column-gap: 1em;
		max-width: 36em;
		margin: 0 auto;
	}

	.board > input {
		font-size: 1.4em;
		grid-column: 1/3;
		padding: 0.5em;
		margin: 0 0 1rem 0;
	}

	h2 {
		font-size: 2em;
		font-weight: 200;
	}
</style>

// Advanved Svelte -> Advanced bindings -> Binding to component instances
<script>
	import Canvas from './Canvas.svelte';
	import { trapFocus } from './actions.svelte.js';

	const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet', 'white', 'black'];

	let selected = $state(colors[0]);
	let size = $state(10);
	let showMenu = $state(true);

  let canvas;
</script>

<div class="container">
	<Canvas bind:this={canvas} color={selected} size={size} />

	{#if showMenu}
		<div
			role="presentation"
			class="modal-background"
			onclick={(event) => {
				if (event.target === event.currentTarget) {
					showMenu = false;
				}
			}}
			onkeydown={(e) => {
				if (e.key === 'Escape') {
					showMenu = false;
				}
			}}
		>
			<div class="menu" use:trapFocus>
				<div class="colors">
					{#each colors as color (color)}
						<button
							class="color"
							aria-label={color}
							aria-current={selected === color}
							style="--color: {color}"
							onclick={() => {
								selected = color;
							}}
						></button>
					{/each}
				</div>

				<label>
					small
					<input type="range" bind:value={size} min="1" max="50" />
					large
				</label>
			</div>
		</div>
	{/if}

	<div class="controls">
		<button class="show-menu" onclick={() => showMenu = !showMenu}>
			{showMenu ? 'close' : 'menu'}
		</button>

    <button onclick={() => canvas.clear()}>
      clear
    </button>
	</div>
</div>

<style>
	.container {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
	}

	.controls {
		position: absolute;
		left: 0;
		top: 0;
		padding: 1em;
	}

	.show-menu {
		width: 5em;
	}

	.modal-background {
		position: fixed;
		display: flex;
		justify-content: center;
		align-items: center;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		backdrop-filter: blur(20px);
	}

	.menu {
		position: relative;
		background: var(--bg-2);
		width: calc(100% - 2em);
		max-width: 28em;
		padding: 1em 1em 0.5em 1em;
		border-radius: 1em;
		box-sizing: border-box;
		user-select: none;
	}

	.colors {
		display: grid;
		align-items: center;
		grid-template-columns: repeat(9, 1fr);
		grid-gap: 0.5em;
	}

	.color {
		aspect-ratio: 1;
		border-radius: 50%;
		background: var(--color, #fff);
		transform: none;
		filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.2));
		transition: all 0.1s;
	}

	.color[aria-current="true"] {
		transform: translate(1px, 1px);
		filter: none;
		box-shadow: inset 3px 3px 4px rgba(0,0,0,0.2);
	}

	.menu label {
		display: flex;
		width: 100%;
		margin: 1em 0 0 0;
	}

	.menu input {
		flex: 1;
	}
</style>

// Advanved Svelte -> Advanced bindings -> Component bindings
<script>
	import Keypad from './Keypad.svelte';

	let pin = $state('');

	let view = $derived(pin
		? pin.replace(/\d(?!$)/g, '•')
		: 'enter your pin');

	function onsubmit() {
		alert(`submitted ${pin}`);
	}
</script>

<h1 style="opacity: {pin ? 1 : 0.4}">
	{view}
</h1>

<Keypad bind:value={pin} {onsubmit} />

// Advanved Svelte -> Advanced bindings -> This
<script lang='ts'>
	import { paint } from './gradient.js';

  let canvas;

	$effect(() => {
		const context = canvas.getContext('2d');

		let frame = requestAnimationFrame(function loop(t) {
			frame = requestAnimationFrame(loop);
			paint(context, t);
		});

		return () => {
			cancelAnimationFrame(frame);
		};
	});
</script>

<canvas bind:this={canvas} width={32} height={32}></canvas>

<style>
	canvas {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background-color: #666;
		mask: url(./svelte-logo-mask.svg) 50% 50% no-repeat;
		mask-size: 60vmin;
		-webkit-mask: url(./svelte-logo-mask.svg) 50% 50% no-repeat;
		-webkit-mask-size: 60vmin;
	}
</style>

// Advanved Svelte -> Advanced bindings -> Dimensions
<script>
	let w = $state();
	let h = $state();
	let size = $state(42);
</script>

<label>
	<input type="range" bind:value={size} min="10" max="100" />
	font size ({size}px)
</label>

<div bind:clientWidth={w} bind:clientHeight={h}>
	<span style="font-size: {size}px" contenteditable>
		edit this text
	</span>

	<span class="size">{w} x {h}px</span>
</div>

<style>
	div {
		position: relative;
		display: inline-block;
		padding: 0.5rem;
		background: hsla(15, 100%, 50%, 0.1);
		border: 1px solid hsl(15, 100%, 50%);
	}

	.size {
		position: absolute;
		right: -1px;
		bottom: -1.4em;
		line-height: 1;
		background: hsl(15, 100%, 50%);
		color: white;
		padding: 0.2em 0.5em;
		white-space: pre;
	}
</style>

// Advanved Svelte -> Advanced bindings -> Media elements
<script>
	import AudioPlayer from './AudioPlayer.svelte';
	import { tracks } from './tracks.js';
</script>

<div class="centered">
	{#each tracks as track (track)}
		<AudioPlayer {...track} />
	{/each}
</div>

<style>
	.centered {
		display: flex;
		flex-direction: column;
		height: 100%;
		justify-content: center;
		gap: 0.5em;
		max-width: 40em;
		margin: 0 auto;
	}
</style>

// Advanved Svelte -> Advanced bindings -> Each block bindings
<script>
	let todos = $state([
		{ done: false, text: 'finish Svelte tutorial' },
		{ done: false, text: 'build an app' },
		{ done: false, text: 'world domination' }
	]);

	function add() {
		todos.push({
			done: false,
			text: ''
		});
	}

	function clear() {
		todos = todos.filter((t) => !t.done);
	}

	let remaining = $derived(todos.filter((t) => !t.done).length);
</script>

<div class="centered">
	<h1>todos</h1>

	<ul class="todos">
		{#each todos as todo (todo)}
			<li class={{ done: todo.done }}>
				<input
					type="checkbox"
					bind:checked={todo.done}
				/>

				<input
					type="text"
					placeholder="What needs to be done?"
					bind:value={todo.text}
				/>
			</li>
		{/each}
	</ul>

	<p>{remaining} remaining</p>

	<button onclick={add}>
		Add new
	</button>

	<button onclick={clear}>
		Clear completed
	</button>
</div>

<style>
	.centered {
		max-width: 20em;
		margin: 0 auto;
	}

	.done {
		opacity: 0.4;
	}

	li {
		display: flex;
	}

	input[type="text"] {
		flex: 1;
		padding: 0.5em;
		margin: -0.2em 0;
		border: none;
	}
</style>

// Advanved Svelte -> Advanced bindings -> Contenteditable bindings
<script>
	let html = $state('<p>Write some text!</p>');
</script>

<div bind:innerHTML={html} contenteditable></div>

<pre>{html}</pre>

<style>
	[contenteditable] {
		padding: 0.5em;
		border: 1px solid #eee;
		border-radius: 4px;
	}
</style>

// Advanved Svelte -> Motion -> Springs
<script>
  import { Spring } from "svelte/motion";
	let coords = new Spring({ x: 50, y: 50 }, {
    stiffness: 0.1,
    damping: 0.25,
  });
	let size = new Spring(10);
</script>

<svg
	onmousemove={(e) => {
		coords.target = { x: e.clientX, y: e.clientY };
	}}
	onmousedown={() => (size.target = 30)}
	onmouseup={() => (size.target = 10)}
	role="presentation"
>
	<circle
		cx={coords.current.x}
		cy={coords.current.y}
		r={size.current}
	></circle>
</svg>

<div class="controls">
	<label>
		<h3>stiffness ({coords.stiffness})</h3>
		<input
			bind:value={coords.stiffness}
			type="range"
			min="0.01"
			max="1"
			step="0.01"
		/>
	</label>

	<label>
		<h3>damping ({coords.damping})</h3>
		<input
			bind:value={coords.damping}
			type="range"
			min="0.01"
			max="1"
			step="0.01"
		/>
	</label>
</div>

<style>
	svg {
		position: absolute;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
	}

	circle {
		fill: #ff3e00;
	}

	.controls {
		position: absolute;
		top: 1em;
		right: 1em;
		width: 200px;
		user-select: none;
	}

	.controls input {
		width: 100%;
	}
</style>

// Advanved Svelte -> Motion -> Tweened values
<script>
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

	let progress = new Tween(0, {
    duration: 400,
    easing: cubicOut,
  });
</script>

<progress value={progress.current}></progress>

<button onclick={() => (progress.target = 0)}>
	0%
</button>

<button onclick={() => (progress.target = 0.25)}>
	25%
</button>

<button onclick={() => (progress.target = 0.5)}>
	50%
</button>

<button onclick={() => (progress.target = 0.75)}>
	75%
</button>

<button onclick={() => (progress.target = 1)}>
	100%
</button>

<style>
	progress {
		display: block;
		width: 100%;
	}
</style>

// Advanved Svelte -> Reusing content -> Passing snippets to components/Implicit snippet props
<script>
	import FilteredList from './FilteredList.svelte';
	import { colors } from './dataV2.js';
</script>

<FilteredList
	data={colors}
	field="name"
>
  <header>
    <span class="color"></span>
    <span class="name">name</span>
    <span class="hex">hex</span>
    <span class="rgb">rgb</span>
    <span class="hsl">hsl</span>
  </header>

  {#snippet row(d)}
    <div class="row">
      <span class="color" style="background-color: {d.hex}"></span>
      <span class="name">{d.name}</span>
      <span class="hex">{d.hex}</span>
      <span class="rgb">{d.rgb}</span>
      <span class="hsl">{d.hsl}</span>
    </div>
  {/snippet}
</FilteredList>

<style>
	header, .row {
		display: grid;
		align-items: center;
		grid-template-columns: 2em 4fr 3fr;
		gap: 1em;
		padding: 0.1em;
		background: var(--bg-1);
		border-radius: 0.2em;
	}

	header {
		font-weight: bold;
	}

	.row:hover {
		background: var(--bg-2);
	}

	.color {
		aspect-ratio: 1;
		height: 100%;
		border-radius: 0.1em;
	}

	.rgb, .hsl {
		display: none;
	}

	@media (min-width: 40rem) {
		header, .row {
			grid-template-columns: 2em 4fr 3fr 3fr;
		}

		.rgb {
			display: block;
		}
	}

	@media (min-width: 60rem) {
		header, .row {
			grid-template-columns: 2em 4fr 3fr 3fr 3fr;
		}

		.hsl {
			display: block;
		}
	}
</style>

// Advanved Svelte -> Reusing content -> Snippets and render tags
<table>
	<thead>
		<tr>
			<th>emoji</th>
			<th>description</th>
			<th>unicode escape sequence</th>
			<th>html entity</th>
		</tr>
	</thead>

  <tbody>
    {#snippet monkey(emoji, description)}
      <tr>
        <td>{emoji}</td>
        <td>{description}</td>
        <td>\u{emoji.charCodeAt(0).toString(16)}\u{emoji.charCodeAt(1).toString(16)}</td>
        <td>&amp#{emoji.codePointAt(0)}</td>
      </tr>
    {/snippet}
    {@render monkey('🙈', 'see no evil')}
		{@render monkey('🙉', 'hear no evil')}
		{@render monkey('🙊', 'speak no evil')}
	</tbody>
</table>

<style>
	th, td {
		padding: 0.5em;
	}

	td:nth-child(3),
	td:nth-child(4) {
		font-family: monospace;
	}
</style>

// Advanved Svelte -> Advanced reactivity -> Stores
<script>
	import Counter from './Counter.svelte';
</script>

<Counter />
<Counter />
<Counter />

// Advanved Svelte -> Advanced reactivity -> Reactive built-ins
<script lang='ts'>
	import { SvelteDate } from "svelte/reactivity";

	let date = new SvelteDate();

	const pad = (n: number) => n < 10 ? '0' + n : n;

	$effect(() => {
		const interval = setInterval(() => {
			date.setTime(Date.now());
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<p>The time is {date.getHours()}:{pad(date.getMinutes())}:{pad(date.getSeconds())}</p>

// Advanved Svelte -> Advanced reactivity -> Reactive classes/Getters and setters
<script lang='ts'>
	const MAX_SIZE = 200;

	class Box {
    #width =  $state(0);
    #height = $state(0);
		area = $derived(this.#width * this.#height);

		constructor(width: number, height: number) {
			this.#width = width;
			this.#height = height;
		}

		embiggen(amount: number) {
			this.width += amount;
			this.height += amount;
		}

    get width() {
      return this.#width;
    }

    get height() {
      return this.#height;
    }

    set width(value: number) {
      this.#width = Math.max(0, Math.min(MAX_SIZE, value));
    }

    set height(value: number) {
      this.#height = Math.max(0, Math.min(MAX_SIZE, value));
    }
	}

	const box = new Box(100, 100);
</script>

<label>
	<input type="range" bind:value={box.width} min={0} max={MAX_SIZE} />
	{box.width}
</label>

<label>
	<input type="range" bind:value={box.height} min={0} max={MAX_SIZE} />
	{box.height}
</label>

<button onclick={() => box.embiggen(10)}>embiggen</button>

<hr>

<div
	class="box"
	style:width="{box.width}px"
	style:height="{box.height}px"
>
	{box.area}
</div>

<style>
	label {
		display: flex;
		align-items: center;
	}

	hr {
		margin: 1em 0;
		border: none;
		border-bottom: 1px solid #888;
	}

	.box {
		background: radial-gradient(at 25% 25%, hsl(15 100 60), hsl(15 100 50)) ;
		border-radius: 2px;
		filter: drop-shadow(0 0 10px hsl(15 100 50 / 0.3));
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
</style>
// Advanved Svelte -> Advanced reactivity -> Raw state
<script>
	import { scale } from './utils.js';
	import { poll } from './data.js';

	let data = $state.raw(poll());

	let w = $state(1);
	let h = $state(1);

	const min = $derived(Math.min(...data) - 5);
	const max = $derived(Math.max(...data) + 5);
	const x = $derived(scale([0, data.length], [0, w]));
	const y = $derived(scale([min, max], [h, 0]));

	const ticks = $derived.by(() => {
		const result = [];
		let n = 10 * Math.ceil(min / 10);
		while (n < max) {
			result.push(n);
			n += 10;
		}
		return result;
	});

	$effect(() => {
		const interval = setInterval(() => {
			data = poll();
		}, 200);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<div class="outer">
	<svg width={w} height={h} bind:clientWidth={w} bind:clientHeight={h}>
		<line y1={h} y2={h} x2={w} />

		{#each ticks as tick}
			<g class="tick" transform="translate(0,{y(tick)})">
				<line x2={w} />
				<text x={-5}>{tick}</text>
			</g>
		{/each}

		<polyline points={data.map((d, i) => [x(i), y(d)]).join(' ')} />

		<text x={10} y={10} font-size={36}>$SVLT</text>
	</svg>
</div>

<style>
	.outer {
		width: 100%;
		height: 100%;
		padding: 2em;
		box-sizing: border-box;
	}

	svg {
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	polyline {
		fill: none;
		stroke: #ff3e00;
		stroke-width: 2;
		stroke-linejoin: round;
		stroke-linecap: round;
	}

	line {
		stroke: #aaa;
	}

	.tick {
		stroke-dasharray: 2 2;

		text {
			text-anchor: end;
			dominant-baseline: middle;
		}
	}
</style>

// Basic Svelte -> Transitions -> Key blocks
<script>
	import { typewriter } from './transition.js';
	import { messages } from './loading-messages.js';

	let i = $state(-1);

	$effect(() => {
		const interval = setInterval(() => {
			i += 1;
			i %= messages.length;
		}, 2500);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<h1>loading...</h1>

{#key i}
<p in:typewriter={{ speed: 10 }}>
	{messages[i] || ''}
</p>
{/key}

// Basic Svelte -> Transitions -> Global transitions
<script>
	import { slide } from 'svelte/transition';

	let items = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

	let showItems = $state(true);
	let i = $state(5);
</script>

<label>
	<input type="checkbox" bind:checked={showItems} />
	show list
</label>

<label>
	<input type="range" bind:value={i} max="10" />
</label>

{#if showItems}
	{#each items.slice(0, i) as item}
		<div transition:slide|global>
			{item}
		</div>
	{/each}
{/if}

<style>
	div {
		padding: 0.5em 0;
		border-top: 1px solid #eee;
	}
</style>

// Basic Svelte -> Transitions -> Transition events
<script>
	import { fly } from 'svelte/transition';

	let visible = $state(true);
	let status = $state('waiting...');
</script>

<p>status: {status}</p>

<label>
	<input type="checkbox" bind:checked={visible} />
	visible
</label>

{#if visible}
	<p
		transition:fly={{ y: 200, duration: 2000 }}
    onintrostart={() => status = 'intro started'}
    onoutrostart={() => status = 'outro started'}
    onintroend={() => status = 'intro ended'}
    onoutroend={() => status = 'outro ended'}
	>
		Flies in and out
	</p>
{/if}

// Basic Svelte -> Transitions -> Custom JS transitions
<script lang='ts'>
	let visible = $state(false);

	function typewriter(node: any, { speed = 1 }) {
		const valid = node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE;

		if (!valid) {
			throw new Error(`This transition only works on elements with a single text node child`);
		}

    const text = node.textContent;
    const duration = text.length / (speed * 0.01);

		return {
      duration,
      tick: (t: any) => {
        const i = Math.trunc(text.length * t);
        node.textContent = text.slice(0, i);
      }
    };
	}
</script>

<label>
	<input type="checkbox" bind:checked={visible} />
	visible
</label>

{#if visible}
	<p transition:typewriter>
		The quick brown fox jumps over the lazy dog
	</p>
{/if}

// Basic Svelte -> Transitions -> Custom CSS transitions
<script lang='ts'>
	import { fade } from 'svelte/transition';
  import { elasticOut } from 'svelte/easing';

	let visible = $state(true);

	function spin(node: any, { duration }: any) {
		return {
			duration,
			css: (t: any, u: any) => {
        const eased = elasticOut(t);

        return `
          transform: scale(${eased}) rotate(${eased * 1000}deg);
          color: hsl(
            ${Math.trunc(t * 360)},
            ${Math.min(100, 1000 * u)}%,
            ${Math.min(50, 500 * u)}%
          );
        `
      }
		};
	}
</script>

<label>
	<input type="checkbox" bind:checked={visible} />
	visible
</label>

{#if visible}
	<div
		class="centered"
		in:spin={{ duration: 8000 }}
		out:fade
	>
		<span>transitions!</span>
	</div>
{/if}

<style>
	.centered {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}

	span {
		position: absolute;
		transform: translate(-50%, -50%);
		font-size: 4em;
	}
</style>

// Basic Svelte -> Transitions -> The transition directive/Adding parameters/In and out
<script lang='ts'>
  import { fade, fly } from 'svelte/transition' ;

	let visible = $state(true);
</script>

<label>
	<input type="checkbox" bind:checked={visible} />
	visible
</label>

{#if visible}
	<p in:fly={{ y: 200, duration: 2000 }} out:fade>
		Flies in, fades out
	</p>
{/if}

// Basic Svelte -> Actions -> Adding parameters
<script lang='ts'>
	import tippy from 'tippy.js';

	let content = $state('Hello!');

	function tooltip(node: any, fn: any) {
		$effect(() => {
			const tooltip = tippy(node, fn());

			return (tooltip as any).destroy;
		});
	}
</script>

<input bind:value={content} />

<button use:tooltip={() => ({ content })}>
	Hover me
</button>

<style>
	:global {
		[data-tippy-root] {
			--bg: #666;
			background-color: var(--bg);
			color: white;
			border-radius: 0.2rem;
			padding: 0.2rem 0.6rem;
			filter: drop-shadow(1px 1px 3px rgb(0 0 0 / 0.1));

			* {
				transition: none;
			}
		}

		[data-tippy-root]::before {
			--size: 0.4rem;
			content: '';
			position: absolute;
			left: calc(50% - var(--size));
			top: calc(-2 * var(--size) + 1px);
			border: var(--size) solid transparent;
			border-bottom-color: var(--bg);
		}
	}
</style>

// Basic Svelte -> Actions -> The use directive
<script>
	import Canvas from './Canvas.svelte';
  import { trapFocus } from './actions.svelte.ts';

	const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet', 'white', 'black'];

	let selected = $state(colors[0]);
	let size = $state(10);
	let showMenu = $state(true);
</script>

<div class="container">
	<Canvas color={selected} size={size} />

	{#if showMenu}
		<div
			role="presentation"
			class="modal-background"
			onclick={(event) => {
				if (event.target === event.currentTarget) {
					showMenu = false;
				}
			}}
			onkeydown={(e) => {
				if (e.key === 'Escape') {
					showMenu = false;
				}
			}}
		>
			<div class="menu" use:trapFocus>
				<div class="colors">
					{#each colors as color}
						<button
							class="color"
							aria-label={color}
							aria-current={selected === color}
							style="--color: {color}"
							onclick={() => {
								selected = color;
							}}
						></button>
					{/each}
				</div>

				<label>
					small
					<input type="range" bind:value={size} min="1" max="50" />
					large
				</label>
			</div>
		</div>
	{/if}

	<div class="controls">
		<button class="show-menu" onclick={() => showMenu = !showMenu}>
			{showMenu ? 'close' : 'menu'}
		</button>
	</div>
</div>

<style>
	.container {
		position: fixed;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
	}

	.controls {
		position: absolute;
		left: 0;
		top: 0;
		padding: 1em;
	}

	.show-menu {
		width: 5em;
	}

	.modal-background {
		position: fixed;
		display: flex;
		justify-content: center;
		align-items: center;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		backdrop-filter: blur(20px);
	}

	.menu {
		position: relative;
		background: var(--bg-2);
		width: calc(100% - 2em);
		max-width: 28em;
		padding: 1em 1em 0.5em 1em;
		border-radius: 1em;
		box-sizing: border-box;
		user-select: none;
	}

	.colors {
		display: grid;
		align-items: center;
		grid-template-columns: repeat(9, 1fr);
		grid-gap: 0.5em;
	}

	.color {
		aspect-ratio: 1;
		border-radius: 50%;
		background: var(--color, #fff);
		transform: none;
		filter: drop-shadow(2px 2px 3px rgba(0,0,0,0.2));
		transition: all 0.1s;
	}

	.color[aria-current="true"] {
		transform: translate(1px, 1px);
		filter: none;
		box-shadow: inset 3px 3px 4px rgba(0,0,0,0.2);
	}

	.menu label {
		display: flex;
		width: 100%;
		margin: 1em 0 0 0;
	}

	.menu input {
		flex: 1;
	}
</style>

// Basic Svelte -> Classes and styles -> Component styles
<script>
  import Box from './Box.svelte';
</script>

<div class='boxes'>
  <Box --color='red' />
  <Box --color='green' />
  <Box --color='blue' />
</div>

<style>
  /*
  .boxes :global(.box:nth-child(1)) {
    background-color: red;
  }

  .boxes :global(.box:nth-child(2)) {
    background-color: green;
  }

  .boxes :global(.box:nth-child(3)) {
    background-color: blue;
  }
  */
</style>

// Basic Svelte -> Classes and styles -> The class attribute/The style directive
<script>
	let flipped = $state(false);
</script>

<div class="container">
	Flip the card
	<button
		class="card"
    style:transform={flipped ? 'rotateY(0)' : ''}
    style:--bg-1='palegoldenrod'
    style:--bg-2='black'
    style:--bg-3='goldenrod'
		onclick={() => flipped = !flipped}
	>
		<div class="front">
			<span class="symbol">♠</span>
		</div>
		<div class="back">
			<div class="pattern"></div>
		</div>
	</button>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		gap: 1em;
		height: 100%;
		align-items: center;
		justify-content: center;
		perspective: 100vh;
	}

	.card {
		position: relative;
		aspect-ratio: 2.5 / 3.5;
		font-size: min(1vh, 0.25rem);
		height: 80em;
		background: var(--bg-1);
		border-radius: 2em;
		transform: rotateY(180deg);
		transition: transform 0.4s;
		transform-style: preserve-3d;
		padding: 0;
		user-select: none;
		cursor: pointer;
	}

	.card.flipped {
		transform: rotateY(0);
	}

	.front, .back {
		display: flex;
		align-items: center;
		justify-content: center;
		position: absolute;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		backface-visibility: hidden;
		border-radius: 2em;
		border: 1px solid var(--fg-2);
		box-sizing: border-box;
		padding: 2em;
	}

	.front {
		background: url(./svelte-logo.svg) no-repeat 5em 5em, url(./svelte-logo.svg) no-repeat calc(100% - 5em) calc(100% - 5em);
		background-size: 8em 8em, 8em 8em;
	}

	.back {
		transform: rotateY(180deg);
	}

	.symbol {
		font-size: 30em;
		color: var(--fg-1);
	}

	.pattern {
		width: 100%;
		height: 100%;
		background-color: var(--bg-2);
		/* pattern from https://projects.verou.me/css3patterns/#marrakesh */
		background-image:
		radial-gradient(var(--bg-3) 0.9em, transparent 1em),
		repeating-radial-gradient(var(--bg-3) 0, var(--bg-3) 0.4em, transparent 0.5em, transparent 2em, var(--bg-3) 2.1em, var(--bg-3) 2.5em, transparent 2.6em, transparent 5em);
		background-size: 3em 3em, 9em 9em;
		background-position: 0 0;
		border-radius: 1em;
	}
</style>

// Basic Svelte -> Bindings -> Textarea inputs
<script lang='ts'>
  // Cannot find marked because it's a third party package
	import { marked } from 'marked';

	let value = $state(`Some words are *italic*, some are **bold**\n\n- lists\n- are\n- cool`);
</script>

<div class="grid">
	input
	<textarea {value}></textarea>

	output
	<div>{@html marked(value)}</div>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: 5em 1fr;
		grid-template-rows: 1fr 1fr;
		grid-gap: 1em;
		height: 100%;
	}

	textarea {
		flex: 1;
		resize: none;
	}
</style>

// Basic Svelte -> Bindings -> Group inputs/Select multiple
<script lang='ts'>
	let scoops = $state(1);
	let flavours: string[] = $state([]);

	const formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' });
</script>

<h2>Size</h2>

{#each [1, 2, 3] as number (number)}
	<label>
		<input
			type="radio"
			name="scoops"
			value={number}
      bind:group={scoops}
		/>

		{number} {number === 1 ? 'scoop' : 'scoops'}
	</label>
{/each}

<h2>Flavours</h2>

<select multiple bind:value={flavours}>
  {#each ['cookies and cream', 'mint choc chip', 'raspberry ripple'] as flavour (flavour)}
    <option>{flavour}</option>
  {/each}
</select>

{#if flavours.length === 0}
	<p>Please select at least one flavour</p>
{:else if flavours.length > scoops}
	<p>Can't order more flavours than scoops!</p>
{:else}
	<p>
		You ordered {scoops} {scoops === 1 ? 'scoop' : 'scoops'}
		of {formatter.format(flavours)}
	</p>
{/if}

// Basic Svelte -> Bindings -> Select bindings
<script lang='ts'>
	let questions = [
		{
			id: 1,
			text: `Where did you go to school?`
		},
		{
			id: 2,
			text: `What is your mother's name?`
		},
		{
			id: 3,
			text: `What is another personal fact that an attacker could easily find with Google?`
		}
	];

	let selected: typeof questions[number] | undefined = $state();

	let answer = $state('');

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();

		alert(
			`answered question ${selected?.id} (${selected?.text}) with "${answer}"`
		);
	}

  console.log('on same tick', selected);
  setTimeout(() => console.log('on next tick', selected))
  setTimeout(() => console.log('2 seconds later', selected), 2000)
</script>

<h2>Insecurity questions</h2>

<form onsubmit={handleSubmit}>
	<select
		bind:value={selected}
		onchange={() => (answer = '')}
	>
		{#each questions as question (question)}
			<option value={question}>
				{question.text}
			</option>
		{/each}
	</select>

	<input bind:value={answer} />

	<button disabled={!answer} type="submit">
		Submit
	</button>
</form>

<p>
	selected question {selected
		? selected.id
		: '[waiting...]'}
</p>

// Basic Svelte -> Bindings -> Checkbox inputs
<script>
  let yes = $state(false);
</script>

<label>
  <input type='checkbox' bind:checked={yes} />
  Yes! Send me regualr email spam
</label>

{#if yes}
  <p>
		Thank you. We will bombard your inbox and sell
		your personal details.
  </p>
{:else}
  <p>
		You must opt in to continue. If you're not
		paying, you're the product.
  </p>
{/if}

<button disabled={!yes}>Subscribe</button>

// Basic Svelte -> Bindings -> Numeric inputs
<script>
  let a = $state(1);
  let b = $state(2);
</script>

<label>
  <input type='number' bind:value={a} min='0' max='10' />
  <input type='range' bind:value={a} min='0' max='10' />
</label>

<label>
  <input type='number' bind:value={b} min='0' max='10' />
  <input type='range' bind:value={b} min='0' max='10' />
</label>

<p>{a} + {b} = {a + b}</p>

// Basic Svelte -> Bindings -> Text inputs
<script>
  let name = $state('world');
  setTimeout(() => {
    name = 'TIMEOUTCHANGE'
  }, 5000)
</script>

<input bind:value={name} />

<h1>Hello {name}!</h1>


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
