await Bun.build({
  entrypoints: [ 'src/index.ts' ],
  outdir: 'public/',
  // minify: true,
  // splitting: true,
})

Bun.spawnSync('bunx tailwindcss -i src/globals.css -o public/style.css --minify'.split(' '))
