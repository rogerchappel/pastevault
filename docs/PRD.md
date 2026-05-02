# pastevault

Status: in-progress

## Scorecard

Total: 72/100
Band: promising
Last scored: 2026-04-29
Scored by: Neo

| Criterion | Points | Notes |
|---|---:|---|
| Problem pain | 15/20 | Useful pain, but scope/daily frequency needs more evidence. |
| Demand signal | 13/20 | Some signal, but needs more external validation. |
| V1 buildability | 15/20 | Feasible, but platform/integration risk remains. |
| Differentiation | 10/15 | Useful angle, but category has adjacent competition. |
| Agentic workflow leverage | 12/15 | Indirectly useful for agent workflows. |
| Distribution potential | 7/10 | Has demo/content potential. |

## Pitch

A local-first clipboard history app for macOS focused on developer snippets, prompt fragments, PR text, and sensitive redaction.

## Why It Matters

Roger and agents copy a lot of commands, PR bodies, prompts, and repo snippets. A focused dev clipboard with privacy defaults could be useful beyond CLI tooling.

## Qualification

The clipboard-manager category is validated broadly, but this specific developer/agent angle needs research. Internal demand exists from repeated PR body/template copy-paste mistakes.

Source / adjacent research: Roger idea: macOS copy/paste history app. Adjacent category has proven utility, but no specific source repo was provided.

Decision: promising

## V1 Scope

- Track text clipboard history locally
- Search and pin snippets
- Detect secrets and redact/hide by default
- Quick paste palette

## Out of Scope

- Cloud sync
- Password manager replacement
- Capturing images/files in V1

## Verification

- Unit or fixture tests for core parsing/generation behavior.
- README with install, quickstart, and safety notes.
- Local-first behavior documented clearly.
- No hidden network, credential, or publish behavior.

## Agent Prompt

Build `pastevault` as a native/local macOS clipboard history app with strong privacy defaults and secret detection tests.
