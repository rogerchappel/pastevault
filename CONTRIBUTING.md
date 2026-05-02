# Contributing

Thanks for helping improve pastevault.

## Local setup

```bash
npm install
npm test
npm run check
npm run build
npm run smoke
bash scripts/validate.sh
```

## Project principles

- Keep behavior local-first and deterministic.
- Do not add telemetry, hidden network calls, or surprise shell execution.
- Redact secrets by default in human and JSON output.
- Use fake-but-pattern-matching secret fixtures only.
- Prefer small, reviewable changes with tests.

## Pull requests

Please include:

- What changed and why
- Tests or smoke commands run
- Any safety/privacy impact
- Screenshots or terminal output for CLI UX changes when useful
