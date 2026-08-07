import assert from 'node:assert/strict';
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
