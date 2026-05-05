# Release candidate readiness

Generated: 2026-05-05T21:26:12Z
Branch: `release-candidate/readiness`
Base: `origin/main`

## Verification

Status: BLOCKED - one or more local readiness checks failed

Checks run:
- `npm run release:check`
- `bash scripts/validate.sh`
- `node releasebox check .`

## Check output summary

    PASS: required directory exists: docs
    PASS: required directory exists: scripts
    PASS: required directory exists: src
    PASS: required directory exists: tests
    PASS: required directory exists: fixtures
    
    Running local project checks where present...
    NOTE: using package manager: npm
    
    > pastevault@0.1.0 check
    > tsc --noEmit
    
    src/cli.ts(2,26): error TS2307: Cannot find module 'node:fs/promises' or its corresponding type declarations.
    src/cli.ts(3,48): error TS2307: Cannot find module 'node:process' or its corresponding type declarations.
    src/cli.ts(41,35): error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
    src/cli.ts(176,17): error TS2580: Cannot find name 'Buffer'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
    src/cli.ts(177,48): error TS2580: Cannot find name 'Buffer'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
    src/cli.ts(178,10): error TS2580: Cannot find name 'Buffer'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
    src/cli.ts(195,17): error TS2339: Property 'url' does not exist on type 'ImportMeta'.
    src/cli.ts(195,35): error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
    src/cli.ts(196,3): error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
    src/fixtures.ts(1,26): error TS2307: Cannot find module 'node:fs/promises' or its corresponding type declarations.
    src/ids.ts(1,40): error TS2307: Cannot find module 'node:crypto' or its corresponding type declarations.
    src/storage.ts(1,52): error TS2307: Cannot find module 'node:fs/promises' or its corresponding type declarations.
    src/storage.ts(2,31): error TS2307: Cannot find module 'node:path' or its corresponding type declarations.
    src/storage.ts(3,25): error TS2307: Cannot find module 'node:os' or its corresponding type declarations.
    src/storage.ts(6,39): error TS2503: Cannot find namespace 'NodeJS'.
    src/storage.ts(6,59): error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
    src/storage.ts(21,19): error TS2503: Cannot find namespace 'NodeJS'.
    src/storage.ts(29,26): error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
    FAIL: package script: check
    
    > pastevault@0.1.0 test
    > node --test --import tsx tests/*.test.ts
    
    node:internal/modules/package_json_reader:301
      throw new ERR_MODULE_NOT_FOUND(packageName, fileURLToPath(base), null);
            ^
    
    Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'tsx' imported from /Users/roger/Developer/my-opensource/.rc-readiness-worktrees/pastevault/
        at Object.getPackageJSONURL (node:internal/modules/package_json_reader:301:9)
        at packageResolve (node:internal/modules/esm/resolve:764:81)
        at moduleResolve (node:internal/modules/esm/resolve:855:18)
        at defaultResolve (node:internal/modules/esm/resolve:988:11)
        at #cachedDefaultResolve (node:internal/modules/esm/loader:697:20)
        at #resolveAndMaybeBlockOnLoaderThread (node:internal/modules/esm/loader:714:38)
        at ModuleLoader.resolveSync (node:internal/modules/esm/loader:746:52)
        at #resolve (node:internal/modules/esm/loader:679:17)
        at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:599:35)
        at onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:628:32) {
      code: 'ERR_MODULE_NOT_FOUND'
    }
    
    Node.js v25.8.0
    ✖ tests/cli.test.ts (123.739833ms)
    node:internal/modules/package_json_reader:301
      throw new ERR_MODULE_NOT_FOUND(packageName, fileURLToPath(base), null);
            ^
    
    Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'tsx' imported from /Users/roger/Developer/my-opensource/.rc-readiness-worktrees/pastevault/
        at Object.getPackageJSONURL (node:internal/modules/package_json_reader:301:9)
        at packageResolve (node:internal/modules/esm/resolve:764:81)
        at moduleResolve (node:internal/modules/esm/resolve:855:18)
        at defaultResolve (node:internal/modules/esm/resolve:988:11)
        at #cachedDefaultResolve (node:internal/modules/esm/loader:697:20)
        at #resolveAndMaybeBlockOnLoaderThread (node:internal/modules/esm/loader:714:38)
        at ModuleLoader.resolveSync (node:internal/modules/esm/loader:746:52)
        at #resolve (node:internal/modules/esm/loader:679:17)
        at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:599:35)
        at onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:628:32) {
      code: 'ERR_MODULE_NOT_FOUND'
    }
    
    Node.js v25.8.0
    ✖ tests/import-format.test.ts (140.272ms)
    node:internal/modules/package_json_reader:301
      throw new ERR_MODULE_NOT_FOUND(packageName, fileURLToPath(base), null);
            ^
    
    Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'tsx' imported from /Users/roger/Developer/my-opensource/.rc-readiness-worktrees/pastevault/
        at Object.getPackageJSONURL (node:internal/modules/package_json_reader:301:9)
        at packageResolve (node:internal/modules/esm/resolve:764:81)
        at moduleResolve (node:internal/modules/esm/resolve:855:18)
        at defaultResolve (node:internal/modules/esm/resolve:988:11)
        at #cachedDefaultResolve (node:internal/modules/esm/loader:697:20)
        at #resolveAndMaybeBlockOnLoaderThread (node:internal/modules/esm/loader:714:38)
        at ModuleLoader.resolveSync (node:internal/modules/esm/loader:746:52)
        at #resolve (node:internal/modules/esm/loader:679:17)
        at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:599:35)
        at onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:628:32) {
      code: 'ERR_MODULE_NOT_FOUND'
    }
    
    Node.js v25.8.0
    ✖ tests/secrets.test.ts (139.608125ms)
    node:internal/modules/package_json_reader:301
      throw new ERR_MODULE_NOT_FOUND(packageName, fileURLToPath(base), null);
            ^
    
    Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'tsx' imported from /Users/roger/Developer/my-opensource/.rc-readiness-worktrees/pastevault/
        at Object.getPackageJSONURL (node:internal/modules/package_json_reader:301:9)
        at packageResolve (node:internal/modules/esm/resolve:764:81)
        at moduleResolve (node:internal/modules/esm/resolve:855:18)
        at defaultResolve (node:internal/modules/esm/resolve:988:11)
        at #cachedDefaultResolve (node:internal/modules/esm/loader:697:20)
        at #resolveAndMaybeBlockOnLoaderThread (node:internal/modules/esm/loader:714:38)
        at ModuleLoader.resolveSync (node:internal/modules/esm/loader:746:52)
        at #resolve (node:internal/modules/esm/loader:679:17)
        at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:599:35)
        at onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:628:32) {
      code: 'ERR_MODULE_NOT_FOUND'
    }
    
    Node.js v25.8.0
    ✖ tests/storage.test.ts (187.514708ms)
    node:internal/modules/package_json_reader:301
      throw new ERR_MODULE_NOT_FOUND(packageName, fileURLToPath(base), null);
            ^
    
    Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'tsx' imported from /Users/roger/Developer/my-opensource/.rc-readiness-worktrees/pastevault/
        at Object.getPackageJSONURL (node:internal/modules/package_json_reader:301:9)
        at packageResolve (node:internal/modules/esm/resolve:764:81)
        at moduleResolve (node:internal/modules/esm/resolve:855:18)
        at defaultResolve (node:internal/modules/esm/resolve:988:11)
        at #cachedDefaultResolve (node:internal/modules/esm/loader:697:20)
        at #resolveAndMaybeBlockOnLoaderThread (node:internal/modules/esm/loader:714:38)
        at ModuleLoader.resolveSync (node:internal/modules/esm/loader:746:52)
        at #resolve (node:internal/modules/esm/loader:679:17)
        at ModuleLoader.getOrCreateModuleJob (node:internal/modules/esm/loader:599:35)
        at onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:628:32) {
      code: 'ERR_MODULE_NOT_FOUND'
    }
    
    Node.js v25.8.0
    ✖ tests/vault.test.ts (187.045625ms)
    ℹ tests 5
    ℹ suites 0
    ℹ pass 0
    ℹ fail 5
    ℹ cancelled 0
    ℹ skipped 0
    ℹ todo 0
    ℹ duration_ms 206.033125
    
    ✖ failing tests:
    
    test at tests/cli.test.ts:1:1
    ✖ tests/cli.test.ts (123.739833ms)
      'test failed'
    
    test at tests/import-format.test.ts:1:1
    ✖ tests/import-format.test.ts (140.272ms)
      'test failed'
    
    test at tests/secrets.test.ts:1:1
    ✖ tests/secrets.test.ts (139.608125ms)
      'test failed'
    
    test at tests/storage.test.ts:1:1
    ✖ tests/storage.test.ts (187.514708ms)
      'test failed'
    
    test at tests/vault.test.ts:1:1
    ✖ tests/vault.test.ts (187.045625ms)
      'test failed'
    FAIL: package script: test
    
    > pastevault@0.1.0 build
    > tsc -p tsconfig.json && node scripts/fix-bin-mode.mjs
    
    src/cli.ts(2,26): error TS2307: Cannot find module 'node:fs/promises' or its corresponding type declarations.
    src/cli.ts(3,48): error TS2307: Cannot find module 'node:process' or its corresponding type declarations.
    src/cli.ts(41,35): error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
    src/cli.ts(176,17): error TS2580: Cannot find name 'Buffer'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
    src/cli.ts(177,48): error TS2580: Cannot find name 'Buffer'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
    src/cli.ts(178,10): error TS2580: Cannot find name 'Buffer'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
    src/cli.ts(195,17): error TS2339: Property 'url' does not exist on type 'ImportMeta'.
    src/cli.ts(195,35): error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
    src/cli.ts(196,3): error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
    src/fixtures.ts(1,26): error TS2307: Cannot find module 'node:fs/promises' or its corresponding type declarations.
    src/ids.ts(1,40): error TS2307: Cannot find module 'node:crypto' or its corresponding type declarations.
    src/storage.ts(1,52): error TS2307: Cannot find module 'node:fs/promises' or its corresponding type declarations.
    src/storage.ts(2,31): error TS2307: Cannot find module 'node:path' or its corresponding type declarations.
    src/storage.ts(3,25): error TS2307: Cannot find module 'node:os' or its corresponding type declarations.
    src/storage.ts(6,39): error TS2503: Cannot find namespace 'NodeJS'.
    src/storage.ts(6,59): error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
    src/storage.ts(21,19): error TS2503: Cannot find namespace 'NodeJS'.
    src/storage.ts(29,26): error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
    FAIL: package script: build
    
    > pastevault@0.1.0 smoke
    > npm run build && bash scripts/smoke.sh
    
    
    > pastevault@0.1.0 build
    > tsc -p tsconfig.json && node scripts/fix-bin-mode.mjs
    
    src/cli.ts(2,26): error TS2307: Cannot find module 'node:fs/promises' or its corresponding type declarations.
    src/cli.ts(3,48): error TS2307: Cannot find module 'node:process' or its corresponding type declarations.
    src/cli.ts(41,35): error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
    src/cli.ts(176,17): error TS2580: Cannot find name 'Buffer'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
    src/cli.ts(177,48): error TS2580: Cannot find name 'Buffer'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
    src/cli.ts(178,10): error TS2580: Cannot find name 'Buffer'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
    src/cli.ts(195,17): error TS2339: Property 'url' does not exist on type 'ImportMeta'.
    src/cli.ts(195,35): error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
    src/cli.ts(196,3): error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
    src/fixtures.ts(1,26): error TS2307: Cannot find module 'node:fs/promises' or its corresponding type declarations.
    src/ids.ts(1,40): error TS2307: Cannot find module 'node:crypto' or its corresponding type declarations.
    src/storage.ts(1,52): error TS2307: Cannot find module 'node:fs/promises' or its corresponding type declarations.
    src/storage.ts(2,31): error TS2307: Cannot find module 'node:path' or its corresponding type declarations.
    src/storage.ts(3,25): error TS2307: Cannot find module 'node:os' or its corresponding type declarations.
    src/storage.ts(6,39): error TS2503: Cannot find namespace 'NodeJS'.
    src/storage.ts(6,59): error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
    src/storage.ts(21,19): error TS2503: Cannot find namespace 'NodeJS'.
    src/storage.ts(29,26): error TS2580: Cannot find name 'process'. Do you need to install type definitions for node? Try `npm i --save-dev @types/node`.
    FAIL: package script: smoke
    NOTE: agent-qc not installed; skipping optional agent check
    
    Validation failed.
    ```
    RESULT: 1 (2s)
    
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
    RESULT: 0 (0s)
    
