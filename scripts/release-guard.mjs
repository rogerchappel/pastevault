import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

export function versionFromTag(tag) {
  const match = /^v(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/.exec(tag);
  if (!match) throw new Error(`release tag must be v<semver>; received ${tag}`);
  return match[1];
}

export function assertTagMatchesVersion(tag, version) {
  const taggedVersion = versionFromTag(tag);
  if (taggedVersion !== version) {
    throw new Error(`tag ${tag} does not match package version ${version}`);
  }
  return taggedVersion;
}

export function isExactPublishedVersion(output, version) {
  if (!output.trim()) return false;
  try {
    const value = JSON.parse(output);
    return value === version || (Array.isArray(value) && value.includes(version));
  } catch {
    return output.trim() === version;
  }
}

function npmView(spec, field) {
  try {
    return execFileSync('npm', ['view', spec, field, '--json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (error) {
    if (error.status === 1 && /E404|404 Not Found/.test(error.stderr || '')) return '';
    throw error;
  }
}

async function main([command, ...args]) {
  const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
  if (command === 'check-tag') {
    assertTagMatchesVersion(args[0], packageJson.version);
    console.log(`${args[0]} matches ${packageJson.name}@${packageJson.version}`);
    return;
  }
  if (command === 'published') {
    const published = isExactPublishedVersion(npmView(`${packageJson.name}@${packageJson.version}`, 'version'), packageJson.version);
    console.log(published ? 'true' : 'false');
    if (process.env.GITHUB_OUTPUT) {
      const { appendFile } = await import('node:fs/promises');
      await appendFile(process.env.GITHUB_OUTPUT, `published=${published}\n`);
    }
    return;
  }
  if (command === 'verify-registry') {
    const tarball = args[0];
    if (!tarball) throw new Error('verify-registry requires a tarball path');
    const integrity = JSON.parse(npmView(`${packageJson.name}@${packageJson.version}`, 'dist.integrity'));
    const actual = `sha512-${createHash('sha512').update(await readFile(tarball)).digest('base64')}`;
    if (integrity !== actual) throw new Error(`registry integrity mismatch: expected ${actual}, received ${integrity}`);
    console.log(`verified ${packageJson.name}@${packageJson.version} ${integrity}`);
    return;
  }
  throw new Error('usage: release-guard.mjs <check-tag TAG|published|verify-registry TARBALL>');
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main(process.argv.slice(2)).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
