import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { main } from '../src/cli.ts';
import { emptyVault } from '../src/storage.ts';
import { PasteVault } from '../src/vault.ts';

async function capture(run: () => Promise<number>) {
  let out = '';
  let err = '';
  const oldOut = process.stdout.write;
  const oldErr = process.stderr.write;
  process.stdout.write = ((chunk: string | Uint8Array) => { out += chunk.toString(); return true; }) as typeof process.stdout.write;
  process.stderr.write = ((chunk: string | Uint8Array) => { err += chunk.toString(); return true; }) as typeof process.stderr.write;
  try {
    const code = await run();
    return { code, out, err };
  } finally {
    process.stdout.write = oldOut;
    process.stderr.write = oldErr;
  }
}

test('cli imports fixtures, searches and redacts by default', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'pastevault-cli-'));
  try {
    const store = join(dir, 'vault.json');
    assert.equal((await capture(() => main(['import', 'fixtures/sample-history.json', '--store', store]))).code, 0);
    const search = await capture(() => main(['search', 'API_KEY', '--store', store]));
    assert.equal(search.code, 0);
    assert.match(search.out, /redacted/);
    assert.doesNotMatch(search.out, /super-secret/);
    const json = await capture(() => main(['list', '--json', '--store', store]));
    assert.equal(JSON.parse(json.out).items.length, 4);
    const exported = await capture(() => main(['export', '--store', store]));
    assert.equal(JSON.parse(exported.out).items.length, 4);
    assert.doesNotMatch(exported.out, /super-secret/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('cli rejects unknown options and options without values', async () => {
  const cases = [
    { argv: ['list', '--wat'], message: 'unknown option: --wat' },
    { argv: ['list', '--store'], message: '--store requires a value' },
    { argv: ['list', '--limit'], message: '--limit requires a value' },
    { argv: ['list', '--tag'], message: '--tag requires a value' },
    { argv: ['list', '--store', '--json'], message: '--store requires a value' }
  ];

  for (const { argv, message } of cases) {
    const result = await capture(() => main(argv));
    assert.equal(result.code, 1, argv.join(' '));
    assert.equal(result.err, `pastevault: ${message}\n`);
  }
});

test('cli keeps documented option invocations compatible', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'pastevault-cli-options-'));
  try {
    const store = join(dir, 'vault.json');
    assert.equal((await capture(() => main(['add', 'first', '--tag', 'docs', '--pin', '--store', store]))).code, 0);
    assert.equal((await capture(() => main(['add', 'second', '--tag', 'ci', '--store', store]))).code, 0);
    const result = await capture(() => main(['list', '--limit', '1', '--tag', 'docs', '--pinned', '--json', '--store', store]));
    assert.equal(result.code, 0);
    assert.equal(JSON.parse(result.out).items.length, 1);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('cli rejects ambiguous ids without mutating the store', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'pastevault-cli-prefix-'));
  try {
    const store = join(dir, 'vault.json');
    const file = emptyVault();
    const vault = new PasteVault(file);
    const first = { ...vault.add({ text: 'first' }), id: 'abc111' };
    const second = { ...vault.add({ text: 'second' }), id: 'abc222' };
    file.items = [first, second];
    await writeFile(store, `${JSON.stringify(file)}\n`);

    assert.equal((await capture(() => main(['show', 'abc1', '--store', store]))).code, 0);
    assert.equal((await capture(() => main(['show', 'abc111', '--store', store]))).code, 0);
    for (const command of ['show', 'pin', 'unpin', 'rm']) {
      const result = await capture(() => main([command, 'abc', '--store', store]));
      assert.equal(result.code, 1, command);
      assert.equal(result.err, 'pastevault: ambiguous snippet id: abc\n');
    }

    const listed = await capture(() => main(['list', '--json', '--store', store]));
    const items = JSON.parse(listed.out).items;
    assert.equal(items.length, 2);
    assert.equal(items.find((item: { id: string }) => item.id === 'abc111').pinned, false);
    assert.equal(items.find((item: { id: string }) => item.id === 'abc222').pinned, false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
