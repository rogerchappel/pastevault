import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyVault } from '../src/storage.ts';
import { PasteVault, safeItem } from '../src/vault.ts';

test('adds, deduplicates and merges tags', () => {
  const vault = new PasteVault(emptyVault('2026-01-01T00:00:00.000Z'));
  const first = vault.add({ text: 'npm test', tags: ['Node'] });
  const second = vault.add({ text: 'npm test', tags: ['ci'], pinned: true });
  assert.equal(first.id, second.id);
  assert.deepEqual(second.tags, ['ci', 'node']);
  assert.equal(second.pinned, true);
  assert.equal(vault.data.items.length, 1);
});

test('searches text, notes and tags', () => {
  const vault = new PasteVault(emptyVault());
  vault.add({ text: 'deploy with smoke tests', tags: ['release'], note: 'ship checklist' });
  vault.add({ text: 'draft readme copy', tags: ['docs'] });
  assert.equal(vault.list({ query: 'smoke' }).length, 1);
  assert.equal(vault.list({ query: 'checklist' }).length, 1);
  assert.equal(vault.list({ tags: ['docs'] })[0]?.text, 'draft readme copy');
});

test('safe items redact by default', () => {
  const vault = new PasteVault(emptyVault());
  const item = vault.add({ text: 'password=correct-horse-battery-staple' });
  assert.match(safeItem(item).text, /redacted/);
  assert.equal(safeItem(item, true).text, item.text);
});
