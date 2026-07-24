#!/usr/bin/env bash
set -euo pipefail
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$repo_root/scripts/lib/assert-output.sh"
tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT
store="$tmp_dir/vault.json"
node "$repo_root/dist/cli.js" import "$repo_root/fixtures/sample-history.json" --store "$store" >/dev/null
node "$repo_root/dist/cli.js" add "ship it" --tag review --store "$store" >/dev/null
assert_output_contains "search" "Deploy" node "$repo_root/dist/cli.js" search deploy --store "$store"
assert_output_contains "list" '"items"' node "$repo_root/dist/cli.js" list --json --store "$store"
assert_output_contains "palette" "#" node "$repo_root/dist/cli.js" palette --store "$store"
assert_output_contains "secrets" "redacted" node "$repo_root/dist/cli.js" secrets --store "$store"
echo "pastevault smoke passed"
