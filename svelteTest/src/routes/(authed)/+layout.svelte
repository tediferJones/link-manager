<script>
  let { children } = $props();
</script>

{@render children()}

<form method='post' action='/logout'>
  <button>log out</button>
</form>
