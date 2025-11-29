<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
  import { resolve } from '$app/paths';
	
	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav>
	<a href={resolve('/')}>home</a>
	<a href={resolve('/about')}>about</a>
  <a href={resolve('/blog')}>blog</a>
</nav>

{@render children()}
