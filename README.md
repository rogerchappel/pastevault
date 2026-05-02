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
