<script lang='ts'>
	const emojis: { [key: string]: string } = {
		apple: '🍎',
		banana: '🍌',
		carrot: '🥕',
		doughnut: '🍩',
		egg: '🥚'
	};

	// `name` is updated whenever the prop value changes...
	let { name } = $props();

	// ...but `emoji` is fixed upon initialisation
	const emoji = emojis[name];
</script>

<p>{emoji} = {name}</p>
