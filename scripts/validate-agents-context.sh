#!/usr/bin/env bash
set -euo pipefail

agents_file="${1:-AGENTS.md}"

require_value() {
  local label="$1"
  local line
  line="$(sed -n "s/^- ${label}:[[:space:]]*//p" "$agents_file")"
  if [ -z "$line" ] || [ "$line" = '``' ]; then
    printf 'AGENTS.md project context is missing %s\n' "$label" >&2
    return 1
  fi
}

for label in Project Repository 'Primary maintainer' 'Default branch' 'Package manager'; do
  require_value "$label"
done

branch_ref="$(sed -n 's/^- Branch from the latest `\([^`]*\)` before editing\.$/\1/p' "$agents_file")"
if [ -z "$branch_ref" ]; then
  printf 'AGENTS.md branch policy is missing a branch-from ref\n' >&2
  exit 1
fi

printf 'AGENTS.md project context is complete\n'
