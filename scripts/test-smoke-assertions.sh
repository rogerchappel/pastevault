#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$repo_root/scripts/lib/assert-output.sh"

assert_output_contains "matching output" "needle" printf '%s\n' "a needle in output"

missing_diagnostic="$(
  {
    if assert_output_contains "missing output" "needle" printf '%s\n' "haystack"; then
      exit 1
    fi
  } 2>&1
)"
case "$missing_diagnostic" in
  *"smoke assertion failed: missing output output did not contain needle"*"command output:"*"haystack"*) ;;
  *)
    printf 'unexpected missing-output diagnostic:\n%s\n' "$missing_diagnostic" >&2
    exit 1
    ;;
esac

failure_diagnostic="$(
  {
    if assert_output_contains "failed command" "needle" sh -c 'printf "%s\n" "command detail"; exit 7'; then
      exit 1
    fi
  } 2>&1
)"
case "$failure_diagnostic" in
  *"smoke assertion failed: failed command command exited 7"*"command output:"*"command detail"*) ;;
  *)
    printf 'unexpected command-failure diagnostic:\n%s\n' "$failure_diagnostic" >&2
    exit 1
    ;;
esac

echo "smoke assertion tests passed"
