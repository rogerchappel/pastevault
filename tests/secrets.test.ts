import test from 'node:test';
import assert from 'node:assert/strict';
import { detectSecrets, redactText, hasSecrets } from '../src/secrets.ts';

test('detects github tokens and redacts values', () => {
  const token = `ghp_${'1234567890abcdefghijklmnopqrstuv'}`;
  const text = `token=${token}`;
  const findings = detectSecrets(text);
  assert.equal(findings[0]?.kind, 'github-token');
  assert.match(redactText(text, findings), /\[redacted:github-token\]/);
  assert.doesNotMatch(redactText(text, findings), /ghp_123/);
});

test('detects generic assignments', () => {
  assert.equal(hasSecrets('API_KEY=super-secret-value-12345'), true);
});

test('leaves ordinary snippets alone', () => {
  const text = 'git status && npm test';
  assert.deepEqual(detectSecrets(text), []);
  assert.equal(redactText(text), text);
});
