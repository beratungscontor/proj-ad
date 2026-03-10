import fs from 'node:fs';
import path from 'node:path';

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else if (entry.isFile()) fs.copyFileSync(from, to);
  }
}

// Next.js standalone output needs `public/` and `.next/static/` alongside server.js
const root = process.cwd();
const standaloneRoot = path.join(root, '.next', 'standalone');

copyDir(path.join(root, 'public'), path.join(standaloneRoot, 'public'));
copyDir(path.join(root, '.next', 'static'), path.join(standaloneRoot, '.next', 'static'));

