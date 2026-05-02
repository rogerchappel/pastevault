import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { defaultStorePath, emptyVault, loadVault, saveVault } from '../src/storage.ts';

test('uses XDG data home when supplied', () => {
  assert.equal(defaultStorePath({ XDG_DATA_HOME: '/tmp/data' }), '/tmp/data/pastevault/vault.json');
});

test('round-trips vault json with private file path', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'pastevault-test-'));
  try {
    const path = join(dir, 'vault.json');
    const vault = emptyVault('2026-01-01T00:00:00.000Z');
    await saveVault(path, vault);
    const loaded = await loadVault(path);
    assert.equal(loaded.version, 1);
    assert.deepEqual(loaded.items, []);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
