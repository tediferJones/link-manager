<script lang='ts'>
  let { data } = $props();
  import { resolve } from '$app/paths';
</script>

<h1>blog</h1>

<ul>
  {#each data.summaries as { slug, title } (slug)}
    <li><a href={resolve(`/blog/${slug}`)}>{title}</a></li>
  {/each}
</ul>
