import fs from 'fs';
import path from 'path';

const replacements = [
  { from: /bg-\[#05080f\]/g, to: 'bg-background' },
  { from: /bg-\[#0a0e17\]/g, to: 'bg-surface' },
  { from: /bg-\[#111827\]/g, to: 'bg-card' },
  { from: /text-white/g, to: 'text-primary' },
  { from: /text-gray-400/g, to: 'text-secondary' },
  { from: /text-gray-300/g, to: 'text-muted' },
  { from: /text-gray-500/g, to: 'text-muted' },
  { from: /border-white\/10/g, to: 'border-border' },
  { from: /border-white\/5/g, to: 'border-border\/50' },
  { from: /border-white\/20/g, to: 'border-border-hover' },
];

function walk(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const { from, to } of replacements) {
        if (from.test(content)) {
          content = content.replace(from, to);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walk('./src');
