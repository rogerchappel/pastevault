import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, symlinkSync } from 'node:fs';
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
  const suppliedTarball = process.argv[2];
  const tarball = suppliedTarball ?? execFileSync('npm', ['pack', '--silent'], { encoding: 'utf8' }).trim();
  execFileSync('tar', ['-xzf', tarball, '-C', dir]);
  const contents = execFileSync('find', [join(dir, 'package'), '-type', 'f'], { encoding: 'utf8' });

  for (const file of required) {
    const path = join(dir, file);
    if (!contents.includes(path)) {
      throw new Error(`packed tarball missing ${file}`);
    }
  }

  const cli = join(dir, 'package/dist/cli.js');
  const aliases = join(dir, 'aliases');
  symlinkSync(join(dir, 'package'), aliases, 'dir');

  for (const path of [cli, join(aliases, 'dist/cli.js')]) {
    const help = execFileSync('node', [path, '--help'], { encoding: 'utf8' });
    if (!help.includes('pastevault add')) {
      throw new Error(`packed CLI help did not include expected usage text via ${path}`);
    }
  }

  const installRoot = join(dir, 'install');
  mkdirSync(installRoot);
  execFileSync('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--prefix', installRoot, tarball]);
  for (const command of ['pastevault', 'pv']) {
    const help = execFileSync(join(installRoot, 'node_modules/.bin', command), ['--help'], { encoding: 'utf8' });
    if (!help.includes('pastevault add')) throw new Error(`installed ${command} command did not run expected CLI`);
  }

  console.log(`package smoke passed for ${tarball}`);
  if (!suppliedTarball) rmSync(tarball, { force: true });
} finally {
  rmSync(dir, { recursive: true, force: true });
}
