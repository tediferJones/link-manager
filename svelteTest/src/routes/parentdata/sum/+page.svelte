<script>
	import { resolve } from '$app/paths';

	let { data } = $props();
</script>

<p>{data.a} + {data.b} = {data.c}</p>
<p><a href={resolve('/parentdata')}>back</a></p>
