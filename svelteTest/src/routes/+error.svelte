<script>
  import { page } from '$app/state';
  import { emojis } from './emojis.js';
</script>

<h1>{page.status} {page.error.message}</h1>
<span style="font-size: 10em">
  {emojis[page.status] ?? emojis[500]}
</span>

<h1>{page.status}</h1>
<p>{page.error.message}</p>
<p>error code: {page.error.code}</p>
