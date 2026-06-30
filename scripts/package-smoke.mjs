import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const required = [
  'package/dist/cli.js',
  'package/dist/index.js',
  'package/fixtures/sample-history.json',
  'package/examples/import-history.json',
  'package/docs/USAGE.md',
  'package/docs/SAFETY.md',
  'package/README.md',
  'package/LICENSE',
  'package/SECURITY.md',
  'package/CHANGELOG.md',
  'package/CONTRIBUTING.md'
];

const dir = mkdtempSync(join(tmpdir(), 'pastevault-pack-'));

try {
  const tarball = execFileSync('npm', ['pack', '--silent'], { encoding: 'utf8' }).trim();
  execFileSync('tar', ['-xzf', tarball, '-C', dir]);
  const contents = execFileSync('find', [join(dir, 'package'), '-type', 'f'], { encoding: 'utf8' });

  for (const file of required) {
    const path = join(dir, file);
    if (!contents.includes(path)) {
      throw new Error(`packed tarball missing ${file}`);
    }
  }

  const help = execFileSync('node', [join(dir, 'package/dist/cli.js'), '--help'], { encoding: 'utf8' });
  if (!help.includes('pastevault add')) {
    throw new Error('packed CLI help did not include expected usage text');
  }

  console.log(`package smoke passed for ${tarball}`);
  rmSync(tarball, { force: true });
} finally {
  rmSync(dir, { recursive: true, force: true });
}
