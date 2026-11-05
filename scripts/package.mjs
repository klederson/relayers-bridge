import { mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
await mkdir('artifacts', { recursive: true });
for (const browser of ['chrome', 'firefox']) {
  execFileSync('zip', ['-q', '-r', '-FS', resolve(`artifacts/relayers-bridge-${browser}.zip`), '.'], { cwd: resolve(`dist/${browser}`) });
  console.log(`artifacts/relayers-bridge-${browser}.zip`);
}
