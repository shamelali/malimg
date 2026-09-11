import { cpSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const standalone = resolve(root, '.next/standalone');

if (!existsSync(standalone)) {
  console.error('Standalone build not found. Run `npm run build` first.');
  process.exit(1);
}

cpSync(resolve(root, '.next/static'), resolve(standalone, '.next/static'), { recursive: true });
cpSync(resolve(root, 'public'), resolve(standalone, 'public'), { recursive: true });

const child = spawn(process.execPath, [resolve(standalone, 'server.js')], {
  cwd: standalone,
  stdio: 'inherit',
  env: {
    ...process.env,
    HOSTNAME: process.env.HOSTNAME ?? '0.0.0.0',
    PORT: process.env.PORT ?? '3000'
  }
});

child.on('exit', (code) => process.exit(code ?? 0));
