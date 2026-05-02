#!/usr/bin/env bash
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT
store="$tmp_dir/vault.json"
node "$repo_root/dist/cli.js" import "$repo_root/fixtures/sample-history.json" --store "$store" >/dev/null
node "$repo_root/dist/cli.js" add "ship it" --tag review --store "$store" >/dev/null
node "$repo_root/dist/cli.js" search deploy --store "$store" | grep -qi deploy
node "$repo_root/dist/cli.js" list --json --store "$store" | grep -q '"items"'
node "$repo_root/dist/cli.js" palette --store "$store" | grep -q '#'
node "$repo_root/dist/cli.js" secrets --store "$store" | grep -q 'redacted'
echo "pastevault smoke passed"
