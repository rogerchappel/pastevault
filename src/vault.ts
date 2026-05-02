import { detectSecrets, redactText } from './secrets.js';
import { hashText, shortId, uniqueTags } from './ids.js';
import type { AddInput, ListOptions, PasteItem, VaultFile } from './types.js';

export class PasteVault {
  constructor(private readonly vault: VaultFile) {}

  get data(): VaultFile {
    return this.vault;
  }

  add(input: AddInput): PasteItem {
    const text = input.text.replace(/\r\n/g, '\n');
    if (!text.trim()) throw new Error('cannot add an empty snippet');
    const existing = this.vault.items.find((item) => item.contentHash === hashText(text));
    const now = input.createdAt ?? new Date().toISOString();
    if (existing) {
      existing.updatedAt = now;
      existing.tags = uniqueTags([...(existing.tags ?? []), ...(input.tags ?? [])]);
      if (input.note) existing.note = input.note;
      if (input.pinned) existing.pinned = true;
      return existing;
    }
    const item: PasteItem = {
      id: shortId(text, now),
      text,
      createdAt: now,
      updatedAt: now,
      source: input.source ?? 'manual',
      pinned: Boolean(input.pinned),
      tags: uniqueTags(input.tags),
      note: input.note,
      contentHash: hashText(text),
      secrets: detectSecrets(text)
    };
    this.vault.items.unshift(item);
    return item;
  }

  importItems(inputs: AddInput[]): PasteItem[] {
    return inputs.map((input) => this.add({ ...input, source: input.source ?? 'import' }));
  }

  list(options: ListOptions = {}): PasteItem[] {
    let items = [...this.vault.items];
    if (options.pinned !== undefined) items = items.filter((item) => item.pinned === options.pinned);
    if (options.tags?.length) {
      const wanted = new Set(uniqueTags(options.tags));
      items = items.filter((item) => item.tags.some((tag) => wanted.has(tag)));
    }
    if (options.query?.trim()) items = searchItems(items, options.query);
    items.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt.localeCompare(a.createdAt));
    return items.slice(0, options.limit ?? 20);
  }

  get(id: string): PasteItem {
    const item = this.vault.items.find((candidate) => candidate.id === id || candidate.id.startsWith(id));
    if (!item) throw new Error(`snippet not found: ${id}`);
    return item;
  }

  pin(id: string, pinned = true): PasteItem {
    const item = this.get(id);
    item.pinned = pinned;
    item.updatedAt = new Date().toISOString();
    return item;
  }

  remove(id: string): PasteItem {
    const index = this.vault.items.findIndex((candidate) => candidate.id === id || candidate.id.startsWith(id));
    if (index < 0) throw new Error(`snippet not found: ${id}`);
    const [removed] = this.vault.items.splice(index, 1);
    return removed;
  }

  stats() {
    const secrets = this.vault.items.filter((item) => item.secrets.length > 0).length;
    const pinned = this.vault.items.filter((item) => item.pinned).length;
    const tags = new Set(this.vault.items.flatMap((item) => item.tags));
    return { items: this.vault.items.length, pinned, withSecrets: secrets, tags: [...tags].sort() };
  }
}

export function safeItem(item: PasteItem, includeSecrets = false): PasteItem {
  return includeSecrets ? { ...item } : { ...item, text: redactText(item.text, item.secrets) };
}

export function searchItems(items: PasteItem[], query: string): PasteItem[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((item) => {
    const haystack = [item.text, item.note ?? '', item.tags.join(' ')].join('\n').toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}
