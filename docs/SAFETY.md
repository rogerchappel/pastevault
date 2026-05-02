# Safety and privacy model

pastevault optimizes for transparent local behavior.

## Data handling

- Snippets are written to a local JSON file only.
- No command makes network requests.
- No telemetry, analytics, update checks, or hidden publishing are implemented.
- Secret findings are metadata used for redaction and auditing.

## Secret handling

pastevault is designed to reduce accidental terminal leaks, not to secure credentials. It stores original text so that clipboard history remains useful, then redacts output by default. Use full-disk encryption and normal developer workstation hygiene for the vault file.

## Explicit reveal

`--reveal` is intentionally per-command. There is no config flag that permanently disables redaction in this MVP.

## Shell behavior

pastevault does not execute snippets. `capture-file` reads a text file; it does not run it. Future shell integrations should remain explicit and opt-in.
