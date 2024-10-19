const buildResult = await Bun.build({
  entrypoints: [
    'src/index.ts',
    'src/content.ts',
    'src/background.ts'
  ],
  outdir: 'public/',
  // minify: true,
  // splitting: true,
})

// console.log('build result', buildResult)

Bun.spawnSync('bunx tailwindcss -i src/globals.css -o public/style.css --minify'.split(' '))
