# pastevault usage guide

## Store selection

Use `--store path/to/vault.json` when testing, demoing, or keeping a project-scoped vault. Without `--store`, pastevault writes to the OS data directory (`$XDG_DATA_HOME/pastevault/vault.json` or `~/.local/share/pastevault/vault.json`).

## Fixture format

Imports accept either an array or an object wrapper:

```json
{
  "items": [
    "plain string snippet",
    {
      "text": "structured snippet",
      "tags": ["docs", "review"],
      "pinned": true,
      "note": "optional note",
      "createdAt": "2026-04-28T09:15:00.000Z"
    }
  ]
}
```

## Automation

All read-style commands support `--json` for agents and shell automation. JSON output is still redacted by default; add `--reveal` only inside trusted local workflows.

```bash
pastevault search "release note" --json | jq '.items[].id'
```

## Quick paste palette

`pastevault palette` prints a compact numbered list with ids and secret indicators. The CLI does not inject keystrokes or paste into other apps; copy the snippet yourself after `show --reveal` if needed.

## Exporting

`pastevault export` emits a JSON bundle suitable for backups, bug reports, or migration tests. It redacts by default just like other commands; use `--reveal` only for trusted local backups.
