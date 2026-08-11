# pastevault

`pastevault` is a local-first TypeScript CLI for keeping developer clipboard history and reusable snippets close at hand. It is intentionally boring about privacy: snippets live in a JSON file on your machine, secret-looking values are detected, and command output hides them unless you explicitly ask to reveal them.

It is useful for prompt fragments, PR text, shell commands, review notes, deploy checklists, and any other small text you copy often.

> MVP note: pastevault is fixture/import friendly today. It does not install a background clipboard watcher yet; use `pastevault add`, `pastevault add --stdin`, `pastevault capture-file`, or `pastevault import` to feed it text.

## Install

```bash
npm install -g pastevault
```

For local development:

```bash
npm install
npm run build
node dist/cli.js --help
```

## Quickstart

```bash
# Import deterministic fixture history
pastevault import fixtures/sample-history.json --store ./.pastevault/vault.json
# Value-taking options may also precede the import source
pastevault import --store ./.pastevault/tagged.json --tag migrated fixtures/sample-history.json

# Add snippets manually
pastevault add "npm run check && npm test" --tag ci --pin
printf 'Ship note: keep it local-first' | pastevault add --stdin --tag notes

# Search and list
pastevault search deploy --store ./.pastevault/vault.json
pastevault list --limit 10 --json
pastevault palette

# Pin, show, and remove
pastevault pin abc123
pastevault show abc123
pastevault rm abc123
```

## Secret-safe by default

Secret-looking content is stored locally so you can recover what you copied, but output is redacted unless `--reveal` is supplied for that command.

```bash
pastevault add "export API_KEY=super-secret-value-12345"
pastevault list          # export [redacted:generic-secret-assignment]
pastevault list --reveal # shows the original text
```

Detected patterns include GitHub tokens, Slack tokens, AWS access key IDs, private keys, bearer tokens, JWT-like values, and common `api_key=...` / `password=...` assignments.

## Commands

| Command | Purpose |
| --- | --- |
| `add <text>` / `add --stdin` | Add a snippet from args or standard input. |
| `import <file.json>` | Import fixture-friendly arrays or `{ "items": [...] }`. |
| `list` | Show recent snippets; pinned items float first. |
| `search <query>` | Search text, notes, and tags. |
| `palette` | Compact quick-paste style listing. |
| `show <id>` | Show one snippet. |
| `pin` / `unpin` | Toggle pin status. |
| `rm` | Remove one snippet. |
| `secrets` | Audit snippets with secret findings, redacted. |
| `stats` | Print count, pins, secret count, and tags. |
| `export` | Emit a redacted JSON export unless `--reveal` is used. |
| `redact <text>` | Redact text without storing it. |
| `capture-file <path>` | Add a text file as a clipboard-like capture. |

Global options include `--store <path>`, `--json`, `--limit <n>`, `--tag <name>`, `--pinned`, and `--reveal`.
Options that take a value reject missing values, and unknown options are errors. Commands that accept an
`<id>` allow an exact ID or a uniquely identifying prefix; ambiguous prefixes are rejected without changes.
Import accepts global options before or after its single `<file.json>` argument. An import-level `--tag`
is added to every imported item while preserving tags supplied by the file.

## Local-first guarantees

- No telemetry.
- No background network calls.
- No cloud sync.
- No password-manager claims.
- The default store is `$XDG_DATA_HOME/pastevault/vault.json` or `~/.local/share/pastevault/vault.json`.
- Writes are atomic and create the vault file with user-only permissions where the platform honors POSIX modes.

## Development

```bash
npm test
npm run check
npm run build
npm run smoke
npm run package:smoke
bash scripts/validate.sh
```

A real CLI smoke is also easy to run:

```bash
tmp="$(mktemp -d)"
node dist/cli.js import fixtures/sample-history.json --store "$tmp/vault.json"
node dist/cli.js search deploy --store "$tmp/vault.json"
```

## What pastevault is not

It is not a password manager, secret vault, or cross-device sync product. If you paste real credentials into it, treat the local vault file with the same care as any other sensitive developer artifact.

## Verification

Run these checks before opening a PR or publishing a release:

```bash
npm test
npm run smoke
npm run package:smoke
npm run release:check
```

Before creating a release tag, update `package.json` and `package-lock.json`, then verify the exact tag/version pair:

```bash
npm ci
npm run release:check
npm run release:guard -- check-tag "v$(node -p \"require('./package.json').version\")"
git tag "v$(node -p \"require('./package.json').version\")"
git push origin "v$(node -p \"require('./package.json').version\")"
```

If npm publication or GitHub release creation failed after the tag was pushed, run the **Release** workflow manually with that existing tag. The workflow checks out the tagged commit, skips an exact version already present on npm, verifies registry integrity and the packed CLI, and creates or repairs the matching GitHub release without moving the tag.

`npm run package:smoke` builds the CLI, creates a dry-run npm tarball, verifies the runtime, fixtures, examples, docs, license, changelog, contribution, and security files are present, then runs the packed CLI help command through direct and filesystem-aliased paths. The alias check covers canonical path differences such as macOS `/var` and `/private/var`.

## Limitations

pastevault is a local-first helper for preparing reviewable evidence. It does not replace human review, live system validation, or project-specific policy checks, and generated output should be inspected before use in release or operational decisions.
