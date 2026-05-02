import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import type { VaultFile } from './types.js';

export function defaultStorePath(env: NodeJS.ProcessEnv = process.env): string {
  const xdg = env.XDG_DATA_HOME;
  const base = xdg && xdg.trim() ? xdg : join(homedir(), '.local', 'share');
  return join(base, 'pastevault', 'vault.json');
}

export function emptyVault(now = new Date().toISOString()): VaultFile {
  return { version: 1, createdAt: now, updatedAt: now, items: [] };
}

export async function loadVault(path: string): Promise<VaultFile> {
  try {
    const raw = await readFile(path, 'utf8');
    return validateVault(JSON.parse(raw));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return emptyVault();
    throw error;
  }
}

export async function saveVault(path: string, vault: VaultFile): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  vault.updatedAt = new Date().toISOString();
  const tmp = `${path}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, `${JSON.stringify(vault, null, 2)}\n`, { mode: 0o600 });
  await rename(tmp, path);
}

export function validateVault(value: unknown): VaultFile {
  if (!value || typeof value !== 'object') throw new Error('vault file must be an object');
  const candidate = value as VaultFile;
  if (candidate.version !== 1) throw new Error('unsupported vault version');
  if (!Array.isArray(candidate.items)) throw new Error('vault items must be an array');
  return candidate;
}
