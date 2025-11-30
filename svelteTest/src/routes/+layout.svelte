<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
  import { resolve } from '$app/paths';
  import { page, navigating, updated } from '$app/state';
  import { onMount } from 'svelte';
	
	let { children } = $props();

  let previous = $state();
	let start = $state();
	let end = $state();

	$effect(() => {
		if (navigating.to) {
			start = Date.now();
			end = null;
			previous = { ...navigating };
		} else {
			end = Date.now();
		}
	});

  let seconds = $state(0);

	onMount(() => {
		const interval = setInterval(() => {
			seconds += 1;
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav data-sveltekit-reload>
	<a href={resolve('/')}>home</a>
	<a href={resolve('/about')}>about</a>
  <a href={resolve('/blog')}>blog</a>
</nav>

<nav>
  <a href={resolve('/')} aria-current={page.url.pathname ==='/'}>
    home
  </a>
  <a href={resolve('/about')} aria-current={page.url.pathname === '/about'}>
    about
  </a>
  {#if navigating.to}
    navigating to {navigating.to.url.pathname}
  {/if}
</nav>

<nav>
	<a href={resolve('/always')}>/always</a>
	<a href={resolve('/always/')}>/always/</a>
	<a href={resolve('/ignore')}>/ignore</a>
	<a href={resolve('/ignore/')}>/ignore/</a>
	<a href={resolve('/never')}>/never</a>
	<a href={resolve('/never/')}>/never/</a>
</nav>

<nav>
	<a href={resolve('/')}>home</a>
	<a href={resolve('/slow-a')} data-sveltekit-preload-data>slow-a</a>
	<a href={resolve('/slow-b')}>slow-b</a>
</nav>

{@render children()}

{#if updated.current}
  <div class='toast'>
    <p>
      A new version of the app is available

      <button onclick={() => location.reload()}>
        reload the page
      </button>
    </p>
  </div>
{/if}

{#if previous && end}
	<p>navigated from {previous.from.url.pathname} to {previous.to.url.pathname} in <strong>{end - start}ms</strong></p>
{/if}

<p>the page has been open for {seconds} seconds</p>
