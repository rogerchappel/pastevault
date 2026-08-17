#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
validator="$repo_root/scripts/validate-agents-context.sh"
fixture="$(mktemp)"
trap 'rm -f "$fixture"' EXIT

expect_failure() {
  local label="$1"
  local expected="$2"
  local output
  if output="$(bash "$validator" "$fixture" 2>&1)"; then
    printf 'expected empty %s to fail validation\n' "$label" >&2
    exit 1
  fi
  case "$output" in
    *"$expected"*) ;;
    *) printf 'unexpected %s diagnostic: %s\n' "$label" "$output" >&2; exit 1 ;;
  esac
}

bash "$validator" "$repo_root/AGENTS.md" >/dev/null

for label in Project Repository 'Primary maintainer' 'Default branch' 'Package manager'; do
  sed "s/^- ${label}:.*$/- ${label}: \`\`/" "$repo_root/AGENTS.md" > "$fixture"
  expect_failure "$label" "missing $label"
done

sed 's/^- Branch from the latest `main` before editing\.$/- Branch from the latest `` before editing./' "$repo_root/AGENTS.md" > "$fixture"
expect_failure 'branch-from ref' 'missing a branch-from ref'

printf 'AGENTS.md context validator tests passed\n'
