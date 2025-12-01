<script>
  import { onMount } from 'svelte';
  // import { invalidate } from '$app/navigation';
  import { invalidateAll } from '$app/navigation';

	let { data } = $props();

  onMount(() => {
    // const interval = setInterval(() => {
    //   invalidate('/invalidation/api/now');
    // }, 1000);

    // const interval = setInterval(() => {
    //   invalidate('data:now');
    // }, 1000);

    const interval = setInterval(() => {
      invalidateAll();
    }, 1000);

    return () => {
      clearInterval(interval);
    }
  });
</script>

<h1>
	{new Intl.DateTimeFormat([], {
		timeStyle: 'full',
		timeZone: data.timezone
	}).format(new Date(data.now))}
</h1>
