import { readdirSync } from 'fs';

const buildResult = await Bun.build({
  entrypoints: [
    'src/index.ts',
    'src/content.ts',
    'src/background.ts',
  ],
  // outdir: 'public/',
  outdir: 'dist/',
  target: 'browser',
  // minify: true,
  // splitting: true,
});

// console.log('build result', buildResult)

function runBash(cmd: string) {
  return Bun.spawnSync(cmd.split(' '));
}

// Bun.spawnSync('bunx tailwindcss -i src/globals.css -o public/style.css --minify'.split(' '))
runBash('bunx tailwindcss -i src/globals.css -o dist/style.css --minify');
readdirSync('public').forEach(file => {
  runBash(`cp public/${file} dist/`);
});
