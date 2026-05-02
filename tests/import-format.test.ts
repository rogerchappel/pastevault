import test from 'node:test';
import assert from 'node:assert/strict';
import { parseImport } from '../src/fixtures.ts';
import { renderList, renderPalette } from '../src/format.ts';
import { emptyVault } from '../src/storage.ts';
import { PasteVault } from '../src/vault.ts';

test('parses import arrays and object wrappers', () => {
  assert.equal(parseImport(['hello'])[0]?.text, 'hello');
  assert.equal(parseImport({ items: [{ text: 'world', tags: ['x'] }] })[0]?.tags?.[0], 'x');
});

test('renders terminal list and palette rows', () => {
  const vault = new PasteVault(emptyVault());
  const item = vault.add({ text: 'hello\nthere', pinned: true });
  assert.match(renderList([item]), /★/);
  assert.match(renderPalette([item]), /#.+hello/);
});
