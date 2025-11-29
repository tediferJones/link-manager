<script lang='ts'>
	import { resolve } from "$app/paths";

  let { data, children } = $props();
</script>

<div class='layout bg-red-500 bg-2 rounded-lg'>
  <main>
    {@render children()}
  </main>
  <aside>
    <h2>More posts</h2>
    <ul>
      {#each data.summaries as { slug, title } (slug)}
        <li>
          <a href={resolve(`/blog/${slug}`)}>{title}</a>
        </li>
      {/each}
    </ul>
  </aside>
</div>

<style>
  @media (min-width: 640px) {
    .layout {
      display: grid;
      gap: 2em;
      grid-template-columns: 1fe 16em;
    }
  }
</style>
