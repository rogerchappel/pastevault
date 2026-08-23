import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import type { PasteItem, SecretFinding, VaultFile } from './types.js';

const PASTE_SOURCES = new Set(['manual', 'clipboard', 'fixture', 'stdin', 'import']);
const SECRET_CONFIDENCES = new Set(['low', 'medium', 'high']);

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
  const candidate = value as Record<string, unknown>;
  if (candidate.version !== 1) throw new Error('unsupported vault version');
  requireString(candidate.createdAt, 'vault createdAt');
  requireString(candidate.updatedAt, 'vault updatedAt');
  if (!Array.isArray(candidate.items)) throw new Error('vault items must be an array');
  candidate.items.forEach(validateItem);
  return candidate as unknown as VaultFile;
}

function validateItem(value: unknown, index: number): asserts value is PasteItem {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`vault item ${index} must be an object`);
  }
  const item = value as Record<string, unknown>;
  for (const field of ['id', 'text', 'createdAt', 'updatedAt', 'contentHash'] as const) {
    requireString(item[field], `vault item ${index} field ${field}`);
  }
  if (typeof item.source !== 'string' || !PASTE_SOURCES.has(item.source)) {
    throw new Error(`vault item ${index} field source must be one of: ${[...PASTE_SOURCES].join(', ')}`);
  }
  if (typeof item.pinned !== 'boolean') {
    throw new Error(`vault item ${index} field pinned must be a boolean`);
  }
  requireStringArray(item.tags, `vault item ${index} field tags`);
  if (item.note !== undefined) requireString(item.note, `vault item ${index} field note`);
  if (!Array.isArray(item.secrets)) {
    throw new Error(`vault item ${index} field secrets must be an array`);
  }
  item.secrets.forEach((finding, findingIndex) => validateSecret(finding, index, findingIndex));
}

function validateSecret(value: unknown, itemIndex: number, findingIndex: number): asserts value is SecretFinding {
  const prefix = `vault item ${itemIndex} field secrets[${findingIndex}]`;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${prefix} must be an object`);
  }
  const finding = value as Record<string, unknown>;
  requireString(finding.kind, `${prefix}.kind`);
  requireNumber(finding.start, `${prefix}.start`);
  requireNumber(finding.end, `${prefix}.end`);
  requireString(finding.preview, `${prefix}.preview`);
  if (typeof finding.confidence !== 'string' || !SECRET_CONFIDENCES.has(finding.confidence)) {
    throw new Error(`${prefix}.confidence must be one of: ${[...SECRET_CONFIDENCES].join(', ')}`);
  }
}

function requireString(value: unknown, path: string): asserts value is string {
  if (typeof value !== 'string') throw new Error(`${path} must be a string`);
}

function requireNumber(value: unknown, path: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`${path} must be a finite number`);
}

function requireStringArray(value: unknown, path: string): asserts value is string[] {
  if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
    throw new Error(`${path} must be an array of strings`);
  }
}
