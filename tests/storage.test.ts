import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { defaultStorePath, emptyVault, loadVault, mutateVault, saveVault } from '../src/storage.ts';

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

test('mutation failures remove their lock without saving', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'pastevault-lock-test-'));
  try {
    const path = join(dir, 'vault.json');
    await assert.rejects(mutateVault(path, () => { throw new Error('stop'); }), /stop/);
    await assert.rejects(readFile(`${path}.lock`, 'utf8'), { code: 'ENOENT' });
    await assert.rejects(readFile(path, 'utf8'), { code: 'ENOENT' });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

const validItem = {
  id: 'item-1',
  text: 'hello',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  source: 'manual',
  pinned: false,
  tags: ['example'],
  contentHash: 'abc123',
  secrets: [{ kind: 'token', start: 0, end: 5, preview: 'hello', confidence: 'low' }],
};

async function assertInvalidVault(mutator: (vault: Record<string, any>) => void, message: RegExp) {
  const dir = await mkdtemp(join(tmpdir(), 'pastevault-invalid-test-'));
  try {
    const path = join(dir, 'vault.json');
    const vault: Record<string, any> = {
      version: 1,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      items: [{ ...validItem, tags: [...validItem.tags], secrets: validItem.secrets.map((item) => ({ ...item })) }],
    };
    mutator(vault);
    await writeFile(path, JSON.stringify(vault));
    await assert.rejects(loadVault(path), message);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test('rejects a non-string item text with its index and field', async () => {
  await assertInvalidVault((vault) => { vault.items[0].text = 42; }, /vault item 0 field text must be a string/);
});

test('rejects missing item fields before downstream use', async () => {
  await assertInvalidVault((vault) => { delete vault.items[0].id; }, /vault item 0 field id must be a string/);
});

test('rejects malformed arrays used by listing and stats', async () => {
  await assertInvalidVault((vault) => { vault.items[0].tags = 'example'; }, /vault item 0 field tags must be an array of strings/);
  await assertInvalidVault((vault) => { vault.items[0].secrets = {}; }, /vault item 0 field secrets must be an array/);
});

test('rejects malformed nested secret findings', async () => {
  await assertInvalidVault((vault) => { vault.items[0].secrets[0].start = 'zero'; }, /vault item 0 field secrets\[0\]\.start must be a finite number/);
});

test('rejects malformed vault metadata', async () => {
  await assertInvalidVault((vault) => { vault.createdAt = null; }, /vault createdAt must be a string/);
});
