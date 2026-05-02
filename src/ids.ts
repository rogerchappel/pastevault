import { createHash, randomUUID } from 'node:crypto';

export function hashText(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

export function shortId(text: string, createdAt: string): string {
  const digest = createHash('sha256').update(`${createdAt}\0${text}\0${randomUUID()}`).digest('base64url');
  return digest.slice(0, 12);
}

export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
}

export function uniqueTags(tags: string[] = []): string[] {
  return [...new Set(tags.map(normalizeTag).filter(Boolean))].sort();
}
