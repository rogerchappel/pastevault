import { readFile } from 'node:fs/promises';
import type { AddInput } from './types.js';

export async function readImportFile(path: string): Promise<AddInput[]> {
  const raw = await readFile(path, 'utf8');
  const parsed = JSON.parse(raw) as unknown;
  return parseImport(parsed);
}

export function parseImport(parsed: unknown): AddInput[] {
  const value = Array.isArray(parsed) ? parsed : (parsed as { items?: unknown })?.items;
  if (!Array.isArray(value)) throw new Error('import file must be an array or { "items": [...] }');
  return value.map((entry, index) => normalizeEntry(entry, index));
}

function normalizeEntry(entry: unknown, index: number): AddInput {
  if (typeof entry === 'string') return { text: entry, source: 'fixture' };
  if (!entry || typeof entry !== 'object') throw new Error(`invalid import item at index ${index}`);
  const candidate = entry as Partial<AddInput>;
  if (typeof candidate.text !== 'string') throw new Error(`import item ${index} is missing text`);
  return {
    text: candidate.text,
    source: candidate.source ?? 'fixture',
    tags: Array.isArray(candidate.tags) ? candidate.tags.map(String) : [],
    note: candidate.note,
    pinned: Boolean(candidate.pinned),
    createdAt: candidate.createdAt
  };
}
