#!/usr/bin/env bash

assert_output_contains() {
  local label="$1"
  local expected="$2"
  shift 2

  local output
  if output="$("$@" 2>&1)"; then
    :
  else
    local status=$?
    printf 'smoke assertion failed: %s command exited %s\n' "$label" "$status" >&2
    printf 'command output:\n%s\n' "$output" >&2
    return "$status"
  fi

  case "$output" in
    *"$expected"*) return 0 ;;
    *)
      printf 'smoke assertion failed: %s output did not contain %s\n' "$label" "$expected" >&2
      printf 'command output:\n%s\n' "$output" >&2
      return 1
      ;;
  esac
}
