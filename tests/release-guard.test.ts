import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { assertTagMatchesVersion, isExactPublishedVersion, versionFromTag } from '../scripts/release-guard.mjs';

test('accepts an exact semver release tag', () => {
  assert.equal(versionFromTag('v0.1.7'), '0.1.7');
  assert.equal(assertTagMatchesVersion('v0.1.7', '0.1.7'), '0.1.7');
});

test('rejects malformed and mismatched release tags', () => {
  assert.throws(() => versionFromTag('0.1.7'), /must be v<semver>/);
  assert.throws(() => assertTagMatchesVersion('v0.1.6', '0.1.7'), /does not match/);
});

test('recognizes only the exact published version', () => {
  assert.equal(isExactPublishedVersion('"0.1.7"\n', '0.1.7'), true);
  assert.equal(isExactPublishedVersion('["0.1.6","0.1.7"]', '0.1.7'), true);
  assert.equal(isExactPublishedVersion('"0.1.6"\n', '0.1.7'), false);
  assert.equal(isExactPublishedVersion('', '0.1.7'), false);
});

test('release dry-run workflow exercises matching and mismatched tags', async () => {
  const workflow = await readFile('.github/workflows/release-dry-run.yml', 'utf8');
  const guardStep = workflow.match(
    /      - name: Exercise release guards\n        run: \|\n((?:          .+\n)+)/,
  );
  assert.ok(guardStep, 'Exercise release guards workflow step must exist');

  const commands = guardStep[1]
    .split('\n')
    .filter(Boolean)
    .map((line) => line.slice(10))
    .join('\n');
  const result = spawnSync('bash', ['-euo', 'pipefail', '-c', commands], {
    cwd: process.cwd(),
    encoding: 'utf8',
  });

  assert.equal(result.status, 0, `workflow guard commands failed:\n${result.stdout}${result.stderr}`);
  assert.match(result.stdout, /v0\.1\.7 matches pastevault@0\.1\.7/);
  assert.match(result.stderr, /tag v0\.0\.0 does not match package version 0\.1\.7/);
});
