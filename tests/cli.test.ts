import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { main } from '../src/cli.ts';

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
