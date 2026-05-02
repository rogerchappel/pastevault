import type { PasteItem } from './types.js';
import { safeItem } from './vault.js';

export function renderJson(payload: unknown): string {
  return `${JSON.stringify(payload, null, 2)}\n`;
}

export function renderList(items: PasteItem[], includeSecrets = false): string {
  if (items.length === 0) return 'No snippets found.\n';
  const rows = items.map((item) => formatRow(safeItem(item, includeSecrets)));
  return `${rows.join('\n')}\n`;
}

export function renderPalette(items: PasteItem[], includeSecrets = false): string {
  if (items.length === 0) return 'No snippets available.\n';
  return `${items.map((item, index) => {
    const safe = safeItem(item, includeSecrets);
    const title = firstLine(safe.text);
    const pin = item.pinned ? '★' : ' ';
    const secret = item.secrets.length ? ' 🔒' : '';
    return `${String(index + 1).padStart(2, ' ')}. ${pin} #${item.id} ${title}${secret}`;
  }).join('\n')}\n`;
}

export function renderShow(item: PasteItem, includeSecrets = false): string {
  const safe = safeItem(item, includeSecrets);
  const parts = [
    `id: ${item.id}`,
    `created: ${item.createdAt}`,
    `source: ${item.source}`,
    `pinned: ${item.pinned ? 'yes' : 'no'}`,
    `tags: ${item.tags.length ? item.tags.join(', ') : '-'}`,
    `secrets: ${item.secrets.length ? item.secrets.map((secret) => secret.kind).join(', ') : 'none'}`,
    '',
    safe.text
  ];
  return `${parts.join('\n')}\n`;
}

function formatRow(item: PasteItem): string {
  const pin = item.pinned ? '★' : ' ';
  const tags = item.tags.length ? ` [${item.tags.join(',')}]` : '';
  const secret = item.secrets.length ? ' 🔒' : '';
  return `${pin} ${item.id} ${firstLine(item.text)}${tags}${secret}`;
}

function firstLine(text: string): string {
  const normalized = text.trim().split('\n')[0] ?? '';
  return normalized.length > 78 ? `${normalized.slice(0, 75)}…` : normalized;
}
