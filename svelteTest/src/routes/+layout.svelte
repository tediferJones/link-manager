<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
  import { resolve } from '$app/paths';
  import { page, navigating, updated } from '$app/state';
	
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
