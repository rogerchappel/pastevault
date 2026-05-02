# Security Policy

## Supported versions

Security fixes target the current `main` branch until the project publishes tagged releases.

## Reporting a vulnerability

Please open a private GitHub security advisory or contact the maintainer through GitHub if private advisories are unavailable. Include:

- pastevault version or commit SHA
- operating system and Node.js version
- reproduction steps
- whether local vault contents, redaction, or command output are affected

## Privacy posture

pastevault is local-first and does not intentionally make network requests. Secret-looking content is redacted in terminal and JSON output by default, but the original text remains in the local vault file. Do not treat pastevault as a password manager or encrypted secret store.

## Handling sensitive fixtures

Do not commit real credentials in fixtures, tests, screenshots, examples, or issues. Use obviously fake values that still match detector patterns.
