# Release candidate readiness

Generated: 2026-05-05T21:32:04Z
Branch: `rc/release-readiness`
Base: `main`

## Verification

Status: PASS

Note: this follow-up PR keeps an open release-readiness review after the earlier `release-candidate/readiness` PR was merged.

Checks run:
- `npm ci`
- `npm run release:check`
- `bash scripts/validate.sh`
- `node releasebox check .`

## Check output summary

    npm run release:check
    ```
    ```text
    
    > pastevault@0.1.0 release:check
    > npm run check && npm test && npm run build && npm run smoke && bash scripts/validate.sh && npm pack --dry-run
    
    
    > pastevault@0.1.0 check
    > tsc --noEmit
    
    
    > pastevault@0.1.0 test
    > node --test --import tsx tests/*.test.ts
    
    ✔ cli imports fixtures, searches and redacts by default (21.750917ms)
    ✔ parses import arrays and object wrappers (0.775417ms)
    ✔ renders terminal list and palette rows (4.252375ms)
    ✔ detects github tokens and redacts values (1.594458ms)
    ✔ detects generic assignments (0.418667ms)
    ✔ leaves ordinary snippets alone (0.717583ms)
    ✔ uses XDG data home when supplied (1.432792ms)
    ✔ round-trips vault json with private file path (15.185208ms)
    ✔ adds, deduplicates and merges tags (3.900084ms)
    ✔ searches text, notes and tags (1.199167ms)
    ✔ safe items redact by default (0.93875ms)
    ℹ tests 11
    ℹ suites 0
    ℹ pass 11
    ℹ fail 0
    ℹ cancelled 0
    ℹ skipped 0
    ℹ todo 0
    ℹ duration_ms 267.115084
    
    > pastevault@0.1.0 build
    > tsc -p tsconfig.json && node scripts/fix-bin-mode.mjs
    
    
    > pastevault@0.1.0 smoke
    > npm run build && bash scripts/smoke.sh
    
    
    > pastevault@0.1.0 build
    > tsc -p tsconfig.json && node scripts/fix-bin-mode.mjs
    
    pastevault smoke passed
    Checking pastevault required files...
    PASS: required file exists: README.md
    PASS: required file exists: AGENTS.md
    PASS: required file exists: CONTRIBUTING.md
    PASS: required file exists: SECURITY.md
    PASS: required file exists: .github/pull_request_template.md
    PASS: required file exists: scripts/validate.sh
    PASS: required file exists: fixtures/sample-history.json
    PASS: required file exists: src/cli.ts
    PASS: required file exists: src/vault.ts
    
    Checking pastevault required directories...
    PASS: required directory exists: .github
    PASS: required directory exists: docs
    PASS: required directory exists: scripts
    PASS: required directory exists: src
    PASS: required directory exists: tests
    PASS: required directory exists: fixtures
    
    Running local project checks where present...
    NOTE: using package manager: npm
    
    > pastevault@0.1.0 check
    > tsc --noEmit
    
    PASS: package script: check
    
    > pastevault@0.1.0 test
    > node --test --import tsx tests/*.test.ts
    
    ✔ cli imports fixtures, searches and redacts by default (14.310333ms)
    ✔ parses import arrays and object wrappers (1.388167ms)
    ✔ renders terminal list and palette rows (2.71575ms)
    ✔ detects github tokens and redacts values (1.223084ms)
    ✔ detects generic assignments (0.557458ms)
    ✔ leaves ordinary snippets alone (0.793291ms)
    ✔ uses XDG data home when supplied (0.53875ms)
    ✔ round-trips vault json with private file path (17.6075ms)
    ✔ adds, deduplicates and merges tags (2.539583ms)
    ✔ searches text, notes and tags (0.416792ms)
    ✔ safe items redact by default (0.17875ms)
    ℹ tests 11
    ℹ suites 0
    ℹ pass 11
    ℹ fail 0
    ℹ cancelled 0
    ℹ skipped 0
    ℹ todo 0
    ℹ duration_ms 463.563125
    PASS: package script: test
    
    > pastevault@0.1.0 build
    > tsc -p tsconfig.json && node scripts/fix-bin-mode.mjs
    
    PASS: package script: build
    
    > pastevault@0.1.0 smoke
    > npm run build && bash scripts/smoke.sh
    
    
    > pastevault@0.1.0 build
    > tsc -p tsconfig.json && node scripts/fix-bin-mode.mjs
    
    pastevault smoke passed
    PASS: package script: smoke
    NOTE: agent-qc not installed; skipping optional agent check
    
    Validation passed.
    npm notice
    npm notice package: pastevault@0.1.0
    npm notice Tarball Contents
    npm notice 1.1kB LICENSE
    npm notice 3.7kB README.md
    npm notice 638B ROADMAP.md
    npm notice 952B SECURITY.md
    npm notice 84B dist/cli.d.ts
    npm notice 8.6kB dist/cli.js
    npm notice 9.5kB dist/cli.js.map
    npm notice 185B dist/fixtures.d.ts
    npm notice 1.2kB dist/fixtures.js
    npm notice 1.4kB dist/fixtures.js.map
    npm notice 377B dist/format.d.ts
    npm notice 1.9kB dist/format.js
    npm notice 2.6kB dist/format.js.map
    npm notice 252B dist/ids.d.ts
    npm notice 611B dist/ids.js
    npm notice 846B dist/ids.js.map
    npm notice 176B dist/index.d.ts
    npm notice 209B dist/index.js
    npm notice 226B dist/index.js.map
    npm notice 264B dist/secrets.d.ts
    npm notice 3.0kB dist/secrets.js
    npm notice 3.1kB dist/secrets.js.map
    npm notice 398B dist/storage.d.ts
    npm notice 1.5kB dist/storage.js
    npm notice 1.9kB dist/storage.js.map
    npm notice 1.1kB dist/types.d.ts
    npm notice 44B dist/types.js
    npm notice 102B dist/types.js.map
    npm notice 750B dist/vault.d.ts
    npm notice 3.7kB dist/vault.js
    npm notice 4.8kB dist/vault.js.map
    npm notice 728B fixtures/sample-history.json
    npm notice 191B fixtures/secret-samples.json
    npm notice 1.5kB package.json
    npm notice Tarball Details
    npm notice name: pastevault
    npm notice version: 0.1.0
    npm notice filename: pastevault-0.1.0.tgz
    npm notice package size: 15.4 kB
    npm notice unpacked size: 57.7 kB
    npm notice shasum: a08f98554d288287de09d50388218616b7a0cbbf
    npm notice integrity: sha512-sruytTQpEvdYT[...]OtZUzII+nRzEw==
    npm notice total files: 34
    npm notice
    pastevault-0.1.0.tgz
    ```
    RESULT: 0
    
    ## bash scripts/validate.sh
    ```
    bash scripts/validate.sh
    ```
    ```text
    Checking pastevault required files...
    PASS: required file exists: README.md
    PASS: required file exists: AGENTS.md
    PASS: required file exists: CONTRIBUTING.md
    PASS: required file exists: SECURITY.md
    PASS: required file exists: .github/pull_request_template.md
    PASS: required file exists: scripts/validate.sh
    PASS: required file exists: fixtures/sample-history.json
    PASS: required file exists: src/cli.ts
    PASS: required file exists: src/vault.ts
    
    Checking pastevault required directories...
    PASS: required directory exists: .github
    PASS: required directory exists: docs
    PASS: required directory exists: scripts
    PASS: required directory exists: src
    PASS: required directory exists: tests
    PASS: required directory exists: fixtures
    
    Running local project checks where present...
    NOTE: using package manager: npm
    
    > pastevault@0.1.0 check
    > tsc --noEmit
    
    PASS: package script: check
    
    > pastevault@0.1.0 test
    > node --test --import tsx tests/*.test.ts
    
    ✔ cli imports fixtures, searches and redacts by default (16.862417ms)
    ✔ parses import arrays and object wrappers (0.526417ms)
    ✔ renders terminal list and palette rows (2.348291ms)
    ✔ detects github tokens and redacts values (1.120042ms)
    ✔ detects generic assignments (0.298458ms)
    ✔ leaves ordinary snippets alone (1.6955ms)
    ✔ uses XDG data home when supplied (0.548417ms)
    ✔ round-trips vault json with private file path (8.279583ms)
    ✔ adds, deduplicates and merges tags (2.726166ms)
    ✔ searches text, notes and tags (0.3725ms)
    ✔ safe items redact by default (0.167375ms)
    ℹ tests 11
    ℹ suites 0
    ℹ pass 11
    ℹ fail 0
    ℹ cancelled 0
    ℹ skipped 0
    ℹ todo 0
    ℹ duration_ms 246.659208
    PASS: package script: test
    
    > pastevault@0.1.0 build
    > tsc -p tsconfig.json && node scripts/fix-bin-mode.mjs
    
    PASS: package script: build
    
    > pastevault@0.1.0 smoke
    > npm run build && bash scripts/smoke.sh
    
    
    > pastevault@0.1.0 build
    > tsc -p tsconfig.json && node scripts/fix-bin-mode.mjs
    
    pastevault smoke passed
    PASS: package script: smoke
    NOTE: agent-qc not installed; skipping optional agent check
    
    Validation passed.
    ```
    RESULT: 0
    
    ## ReleaseBox check
    ```
    node '/Users/roger/Developer/my-opensource/releasebox/bin/releasebox.js' check .
    ```
    ```text
    ✅ releasebox config: node-cli
    ✅ ci workflow: .github/workflows/ci.yml
    ✅ release dry run workflow: .github/workflows/release-dry-run.yml
    ✅ task breakdown: docs/TASKS.md
    ✅ orchestration plan: docs/ORCHESTRATION.md
    ✅ dependabot config: .github/dependabot.yml
    ✅ npm test script: node --test --import tsx tests/*.test.ts
    ✅ build script: tsc -p tsconfig.json && node scripts/fix-bin-mode.mjs
    ✅ smoke script: npm run build && bash scripts/smoke.sh
    ✅ bin entry: {"pastevault":"./dist/cli.js","pv":"./dist/cli.js"}
    ```
    RESULT: 0
    
