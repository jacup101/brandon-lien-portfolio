import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, '../..');

export function loadJson<T>(relativePath: string): T {
  const raw = readFileSync(path.join(REPO_ROOT, relativePath), 'utf-8');
  return JSON.parse(raw) as T;
}

export function saveJson(relativePath: string, data: unknown): void {
  writeFileSync(
    path.join(REPO_ROOT, relativePath),
    JSON.stringify(data, null, 2) + '\n',
    'utf-8'
  );
}
