<script>
	import { resolve } from '$app/paths';

	let { children } = $props();
</script>

<nav>
	<a href={resolve('/America/New_York')}>New York</a>
	<a href={resolve('/America/Sao_Paulo')}>São Paulo</a>
	<a href={resolve('/Europe/London')}>London</a>
	<a href={resolve('/Europe/Paris')}>Paris</a>
	<a href={resolve('/Africa/Cairo')}>Cairo</a>
	<a href={resolve('/Asia/Shanghai')}>Shanghai</a>
	<a href={resolve('/Asia/Tokyo')}>Tokyo</a>
	<a href={resolve('/Australia/Sydney')}>Sydney</a>
	<a href={resolve('/America/Los_Angeles')}>Los Angeles</a>
</nav>

{@render children()}
