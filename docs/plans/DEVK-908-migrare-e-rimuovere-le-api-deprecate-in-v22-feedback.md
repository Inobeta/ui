# DEVK-908 — Migrare e rimuovere le API deprecate in v22 — Post-implementation feedback

## References
- Original plan: `docs/plans/DEVK-908-migrare-e-rimuovere-le-api-deprecate-in-v22.md`.
- Branch reviewed: `develop/22.0.0` vs `origin/develop/22.0.0` (`origin/develop` and local `develop` do not exist).
- Review date: `2026-08-07`.

## Verdict
**FAIL**

One integrated review step was evaluated. Three BLOCKERs, five WARNINGs, and zero NITs were found. All six mandatory build/test commands pass under Node 26, package assets and coverage pass, but two migration-safety defects and retained Kai Table compatibility documentation prevent PASS.

## Reviewed steps

### Step 17 — Verificare la rimozione integrata
- **Original plan state**: not marked `[DONE]` because this is the review unit.
- **Acceptance criteria**: 7 passed / 10 evaluated gates. Executor routing, required command set, packed assets, accepted package smoke, library-source removal, `IbToolTestModule`, and deprecated-marker cleanup pass. Migration safety, complete Kai Table symbol cleanup, and prohibited-change checks fail.
- **Verification commands**: 6 pass / 0 fail for the mandatory command set under Node `v26.7.0`; 4 focused migration suites pass. Two additional adversarial migration checks fail.
- **Expected files**: `.opencode/agents/`, `package.json`, `package-lock.json`, `ng-package.json`, `public_api.ts`, `migrations/`, `src/app/core/http/`, removed HTTP/Forms/Material Forms trees, Kai Table source/specs, `IbToolTestModule`, and affected docs/Storybook files.
- **Files actually changed** (diff vs tracking branch): the three executor definitions; `.storybook/i18n.ts`; package and ng-packagr metadata; `public_api.ts`; new untracked `migrations/`; new untracked `src/app/core/http/`; demo app configuration; removed library HTTP, Forms, and Material Forms trees; Kai Table production/spec files; `IbToolTestModule`; Kai Filter, translation, hydration, and release documentation.
- **Issues found**:
  - `[BLOCKER]` No-use consumers can be blocked by unrelated destination collisions. `preflightFamily()` checks every payload destination before determining whether removed symbols are used (`migrations/update-22/lib/engine.js:223-235`); Forms duplicates this behavior (`migrations/update-22/forms/index.js:161-168`). A packaged-migration check with only `IbToastService` and a consumer-owned `src/app/core/http/index.ts` exits `1` with `Preflight failed for HTTP`. This violates the no-use/no-prompt path and makes `ng update` unsafe for consumers already using these common local directories.
  - `[BLOCKER]` HTTP dependency handling is outside the atomic branch. The coordinator commits HTTP copies/import rewrites, then parses and overwrites `package.json` on the original tree (`migrations/update-22/index.js:46-50`, `migrations/update-22/http/index.js:52-65`). With malformed JSON, the migration exits `1` after `HTTP_PAYLOAD_EXISTS_AFTER_FAILURE=true` and `IMPORT_REWRITTEN_AFTER_FAILURE=true`. This violates full preflight, rollback, and per-family atomicity.
  - `[BLOCKER]` Removed Kai Table compatibility symbols remain in maintained documentation. `src/app/inobeta-ui/ui/kai-table/table.mdx:1381-1391` still documents and imports `ibTableSelectUrlState`, `ibTableSelectLastQueryStringRaw`, `ibTableSelectLastQueryString`, `IbKaiTableNamedParams`, and `IbTableQsParams`; `src/app/inobeta-ui/ui/kai-table/deprecation-guide.md:92,154-160` says `IbTableDataSource` remains available and lists removed URL APIs. Unit 17 explicitly requires no removed compatibility symbol in Kai Table, so the cleanup gate fails even though declarations and runtime exports are absent.
  - `[WARNING]` Kai Filter was realigned through a behaviorally different date adapter outside the planned removal files. `src/app/inobeta-ui/ui/kai-filter/filters.module.ts:22,92-99` now uses the pre-existing core adapter; `src/app/inobeta-ui/core/datepicker.intl.ts:30-38` assumes a string and calls `split`, whereas the removed Material Forms adapter delegated non-string values to `NativeDateAdapter`. This can throw for non-string parse inputs. No focused regression test proves maintained date-filter behavior is unchanged.
  - `[WARNING]` Thirteen explicit `any` additions appear in changed Kai Table specs: six in `table-url.service.spec.ts` and seven `IbTableLocalDataSource<any>` casts in `table.component.spec.ts`. Production diff introduces no new explicit `any`, but the plan and library convention prohibit introducing it.
  - `[WARNING]` Package smoke proves dist-only loading, file creation, import splitting, prompt order, and dependency insertion, but it does not compile a migrated consumer containing vendored Forms and Material Forms. Step 5's local import-graph compile criterion therefore has no direct compile validation.
  - `[WARNING]` Critical implementation trees `migrations/` and `src/app/core/` remain untracked. Current workspace validation sees them, but omitting them from the delivered change would remove the migration and break demo imports.
  - `[WARNING]` Several implementation files fall outside the per-step allowed-file lists: `.storybook/i18n.ts`, `src/app/inobeta-ui/hydration/hydration.mdx`, `src/app/inobeta-ui/translate/how_to_translate.mdx`, `src/app/inobeta-ui/translate/translate-loader.service.ts`, and `src/app/inobeta-ui/ui/kai-filter/filters.module.ts`. Most edits are removal fallout; the Kai Filter change also carries the behavior risk above.
- **Notes**:
  - Required command results under Node `v26.7.0`: lint `0`, migration tests `0`, packagr `0`, app build `0`, CI tests `0`, Storybook build `0`.
  - Migration suites: 48/48 aggregate tests pass; package smoke 4/4, engine 13/13, HTTP 21/21, Forms 6/6. Covered fixtures include accept, decline, non-TTY, differing collision, unsupported syntax rollback, and idempotency.
  - Packed `dist/` artifact: 112 entries, including 101 migration entries; HTTP payload 30 files, Forms payload 18 files, Material Forms payload 23 files. Collection, bridge, engine, HTTP/Forms manifests, and all three payload barrels are present.
  - CI tests: 46 files, 718 tests, zero failures or skips. Coverage: statements 90.75%, branches 84.56%, functions 90.00%, lines 91.32%.
  - Library directories `src/app/inobeta-ui/http`, `ui/forms`, and `ui/material-forms` are absent. `public_api.ts` and generated declarations expose none of their removed symbols. Canonical Kai Table declarations remain exported.
  - `IbToolTestModule` remains consumed by Modal and Toast suites, has no `@deprecated`, and contains only translate/dialog providers. Full CI tests prove removed HTTP testing providers are not required.
  - No `@deprecated` marker exists under maintained library source or vendored payloads. No Formly reference and no focused/skipped test marker was found.
  - Lint exits `0` but reports existing/copied warnings, including explicit `any` in the local demo HTTP fallback.

## Files outside the plan scope

- `[WARNING]` `.storybook/i18n.ts` — necessary translation cleanup, but not listed in Step 8's allowed files.
- `[WARNING]` `src/app/inobeta-ui/hydration/hydration.mdx` — removed HTTP documentation reference outside Step 8's allowed files.
- `[WARNING]` `src/app/inobeta-ui/translate/how_to_translate.mdx` — removed HTTP/Material Forms documentation reference outside Step 8's allowed files.
- `[WARNING]` `src/app/inobeta-ui/translate/translate-loader.service.ts` — production dependency cleanup outside Step 10's allowed files.
- `[WARNING]` `src/app/inobeta-ui/ui/kai-filter/filters.module.ts` — maintained production feature changed to remove a Material Forms dependency; semantic equivalence is not fully validated.

## Scope Check

Overall feature scope remains DEVK-908, but per-step executor boundaries were crossed by the five files above. Migration executor files themselves stayed within `migrations/` and migration-specific package metadata. No mobile Kai Table implementation change was found.

## Convention Violations

- New explicit `any` casts in Kai Table specs violate `inobeta-ui-conventions` and Step 14's no-cast constraint.
- Removed compatibility symbols remain presented as usable public APIs in Kai Table MDX, making maintained documentation inconsistent with `public_api.ts`.
- No new Angular-template cast/type assertion or hardcoded Angular UI text was found in reviewed changes.

## Missing Validation

- No fixture covers an unrelated pre-existing destination collision when that migration family has no imported symbol.
- No fixture forces dependency-update failure after HTTP acceptance and asserts byte-identical rollback.
- No consumer TypeScript/Angular compile fixture validates both vendored Forms trees from the packed artifact.
- No focused Kai Filter test covers `DateAdapter.parse()` with null, Date, or other non-string input after adapter replacement.

## Suggested Fixes

1. Fix no-use collision ordering first; it can block otherwise unaffected consumers.
2. Move `jwt-decode` preparation into the HTTP transaction and add post-failure rollback coverage.
3. Remove stale Kai Table compatibility documentation before publishing Storybook/docs.
4. Add packed Forms compile coverage, then verify Kai Filter date parsing and remove new test-only `any` casts.
5. Ensure untracked migration and demo HTTP trees are included in the delivered change.

## Remediation plan

### Remediation 1 — Ignore payload collisions for unused families [agent: migration-executor] [model: `openai/gpt-5.6-sol`] ✅ DONE [2026-08-07T13:06:25.508Z]

**Observed problem**: HTTP and Forms preflight validate payload collisions even when no removed symbol is imported, causing no-use consumers to fail `ng update`.

**Original step**: 3 — Implementare il motore sicuro di migrazione; 17 — Verificare la rimozione integrata.

**Prompt for the agent**:

~~~
## TASK:
Prevent destination collisions from blocking migration families that are not used.

## CONTEXT:
`preflightFamily()` and `migrateFormsFamily()` inspect payload destinations before confirming that consumer imports require the family. A consumer with no removed imports but an existing `src/app/core/http/` or Forms directory currently fails.

## OBJECTIVE:
Make unused families true no-ops while preserving collision rejection before any write when a family is required.

## REQUIREMENTS:
1. Determine whether supported removed symbols are imported before validating payload destination collisions.
2. Return `noop` without prompt, copies, collision errors, or edits when no family symbol is used.
3. Preserve unsupported-import diagnostics when they directly reference `@inobeta/ui` migration syntax.
4. Add HTTP, Forms, and shared-engine fixtures for no-use plus differing destination content.
5. Preserve required-family collision rollback and idempotency behavior.

## CONSTRAINTS:
- Modify only migration engine, HTTP/Forms migration tests, and their fixtures.
- Do not weaken collision checks for a required family.
- Do not write directly to consumer disk.

## OUTPUT:
Report changed preflight order, added fixtures, and migration test results.

## ACCEPTANCE CRITERIA:
- A no-use tree with differing files under all three destinations completes as `noop` with zero edits.
- A required family with a differing destination still fails before writes.
- `npm run test-migrations` exits 0.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 2 — Make HTTP dependency update atomic [agent: migration-executor] [model: `openai/gpt-5.6-sol`] ✅ DONE [2026-08-07T13:10:20.756Z]

**Observed problem**: HTTP source/import edits commit before `package.json` parsing and dependency insertion, so dependency failure leaves a partially migrated consumer.

**Original step**: 4 — Implementare la migrazione fallback HTTP; 17 — Verificare la rimozione integrata.

**Prompt for the agent**:

~~~
## TASK:
Include HTTP dependency validation and insertion in the HTTP family transaction.

## CONTEXT:
The coordinator calls `ensureJwtDecodeDependency(tree)` after `migrateFamily()` merges its staged branch. Invalid or unwritable package metadata therefore fails after HTTP files and imports are committed.

## OBJECTIVE:
Ensure HTTP payload copies, import rewrites, and `jwt-decode` package changes either all commit or all roll back.

## REQUIREMENTS:
1. Parse and validate relevant `package.json` content during HTTP preflight.
2. Stage dependency insertion on the same branch as payload copies and import rewrites.
3. Do not change `package.json` when HTTP is declined or unused.
4. Preserve existing dependency versions and formatting behavior already asserted by tests.
5. Add a failure fixture proving byte-identical rollback when dependency preparation fails.

## CONSTRAINTS:
- Modify only HTTP coordinator/config, shared engine primitives if necessary, and migration tests/fixtures.
- Do not catch and ignore malformed package metadata.
- Do not commit any HTTP-family edit before dependency preparation succeeds.

## OUTPUT:
Report transaction-boundary changes and rollback fixture results.

## ACCEPTANCE CRITERIA:
- Forced package dependency failure leaves imports, payload destinations, and `package.json` byte-identical.
- Accepted HTTP migration adds `jwt-decode` and all source/import edits in one commit.
- `npm run test-migrations` exits 0.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 3 — Remove stale Kai Table compatibility docs [agent: task-executor] [model: `openai/gpt-5.6-sol`] ✅ DONE [2026-08-07T13:12:26.593Z]

**Observed problem**: Kai Table MDX and the deprecation guide still advertise removed symbols and include an invalid package import example.

**Original step**: 8 — Rimuovere documentazione e stories legacy; 13 — Rimuovere le API compatibility Kai Table.

**Prompt for the agent**:

~~~
## TASK:
Remove stale documentation for deleted Kai Table compatibility APIs.

## CONTEXT:
`table.mdx` and `deprecation-guide.md` still describe removed selectors, types, URL methods, and `IbTableDataSource` as available after their v22 deletion.

## OBJECTIVE:
Make maintained Kai Table documentation describe only canonical v22 APIs.

## REQUIREMENTS:
1. Remove usage instructions and imports for every deleted compatibility symbol.
2. Remove or update statements claiming `IbTableDataSource` or legacy URL APIs remain available.
3. Retain canonical migration guidance where it remains accurate.
4. Do not alter unrelated table documentation or production code.

## CONSTRAINTS:
- Modify only `src/app/inobeta-ui/ui/kai-table/table.mdx` and `src/app/inobeta-ui/ui/kai-table/deprecation-guide.md`.
- Do not restore aliases or compatibility declarations.
- Do not perform broad editorial rewrites.

## OUTPUT:
Report removed stale sections and Storybook validation.

## ACCEPTANCE CRITERIA:
- `rg 'IbTableDataSource|IbTableQsParams|IbKaiTableNamedParams|ibTableSelectUrlState|ibTableSelectLastQueryString' src/app/inobeta-ui/ui/kai-table --glob '*.{md,mdx}'` returns no match.
- `npm run build-storybook` exits 0.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 4 — Compile packed vendored Forms fixture [agent: migration-executor] [model: `openai/gpt-5.6-sol`] ✅ DONE [2026-08-07T13:20:22.649Z]

**Observed problem**: Current package smoke validates generated text and assets but never compiles the vendored Forms/Material Forms consumer graph.

**Original step**: 5 — Implementare la migrazione fallback Forms; 6 — Verificare la migrazione dal package generato.

**Prompt for the agent**:

~~~
## TASK:
Add a compile-level smoke fixture for packed Forms vendoring.

## CONTEXT:
The dist-only package smoke accepts both prompts and inspects rewritten imports/files, but does not compile the generated local Forms and Material Forms source.

## OBJECTIVE:
Prove the packed migration produces a TypeScript/Angular-resolvable local source graph without repository-source fallback.

## REQUIREMENTS:
1. Build a minimal consumer fixture using only the packed package and declared consumer dependencies.
2. Run the packaged migration with Forms accepted.
3. Compile or type-check the migrated local Forms and Material Forms graph.
4. Fail on unresolved sibling imports, removed package imports, or missing payload files.
5. Keep the fixture deterministic and self-contained.

## CONSTRAINTS:
- Modify only migration tests, fixtures, and migration-specific package setup.
- Do not import migration code or deleted library source from repository paths.
- Do not add Formly.

## OUTPUT:
Report fixture structure, compile command, and result.

## ACCEPTANCE CRITERIA:
- The fixture loads migration code and payloads exclusively from `dist/`.
- Vendored Forms and Material Forms compile successfully.
- `npm run test-migrations` exits 0.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~


### Remediation 5 — Preserve Kai Filter date parsing [agent: task-executor] [model: `openai/gpt-5.6-sol`] ✅ DONE [2026-08-07T13:21:41.732Z]

**Observed problem**: Kai Filter now uses a core date adapter whose `parse()` assumes string input, unlike the removed adapter that delegated non-string values to `NativeDateAdapter`.

**Original step**: 10 — Rimuovere HTTP e Forms dalla libreria.

**Prompt for the agent**:

~~~
## TASK:
Preserve Kai Filter date-adapter parsing behavior after Material Forms removal.

## CONTEXT:
`IbFilterModule` switched from the removed Material Forms adapter to `IbMatDateAdapter` in core. The core adapter calls `split()` for every non-empty input, while the former adapter delegated non-string values to `NativeDateAdapter`.

## OBJECTIVE:
Keep the retained Kai Filter date adapter safe for string and non-string values without restoring Material Forms.

## REQUIREMENTS:
1. Align the retained adapter's `parse()` contract with Angular `DateAdapter` input semantics.
2. Preserve `dd/MM/yyyy` string parsing and formatting.
3. Delegate supported non-string values to `NativeDateAdapter` as before.
4. Keep locale injection and current provider wiring valid.
5. Do not change other core or Kai Filter behavior.

## CONSTRAINTS:
- Modify only `src/app/inobeta-ui/core/datepicker.intl.ts` and, only if required, `src/app/inobeta-ui/ui/kai-filter/filters.module.ts`.
- Do not restore Material Forms source or exports.
- Do not redesign date formats or localization.

## OUTPUT:
Report behavior equivalence and build results.

## ACCEPTANCE CRITERIA:
- String `dd/MM/yyyy`, empty string, null, and Date inputs do not regress from the former adapter behavior.
- `npm run packagr` exits 0.
- `npm run build` exits 0.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 6 — Remove new Kai Table test anys [agent: unit-jasmine-executor] [model: `openai/gpt-5.6-sol`] ✅ DONE [2026-08-07T13:24:10.589Z]

**Observed problem**: Changed Kai Table specs add thirteen explicit `any` usages despite the no-new-`any` and no-cast constraints.

**Original step**: 14 — Riallineare i test Kai Table canonici.

**Prompt for the agent**:

~~~
## TASK:
Replace newly added explicit `any` casts in changed Kai Table specs.

## CONTEXT:
`table-url.service.spec.ts` and `table.component.spec.ts` added explicit `any` while removing compatibility APIs and moving hosts to `IbTableLocalDataSource`.

## OBJECTIVE:
Keep the same canonical behavior assertions with typed test setup and data-source access.

## REQUIREMENTS:
1. Replace only explicit `any` additions introduced by this DEVK-908 change.
2. Use narrow test interfaces, Angular router types, `unknown`, or concrete row types as appropriate.
3. Preserve every current expectation and test count.
4. Do not restore removed compatibility types.

## CONSTRAINTS:
- Modify only `src/app/inobeta-ui/ui/kai-table/table-url.service.spec.ts` and `src/app/inobeta-ui/ui/kai-table/table.component.spec.ts`.
- Do not modify production source.
- Do not skip, focus, delete, or weaken tests.

## OUTPUT:
Report replaced casts and targeted test result.

## ACCEPTANCE CRITERIA:
- The DEVK-908 added-line diff for both specs contains no explicit `any`.
- `npx ng test --include='src/app/inobeta-ui/ui/kai-table/**/*.spec.ts' --watch=false --coverage=false` exits 0.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

## Commands executed during this review

Chronological list of relevant shell commands run, with result:

- `git status --short --branch` → PASS.
- `git branch --show-current && git log --oneline -10` → PASS.
- `git diff --name-status origin/develop...HEAD` → FAIL (`origin/develop` does not exist).
- `git diff --stat origin/develop...HEAD` → FAIL (same missing base).
- `git diff --check origin/develop...HEAD` → FAIL (same missing base).
- `git diff --name-status origin/develop/22.0.0 && git diff --check origin/develop/22.0.0` → PASS.
- `git diff --stat origin/develop/22.0.0` → PASS.
- `npm run lint` under shell Node `v24.8.0` → FAIL (Angular CLI requires Node `v24.15.0+` or `v26`).
- `node --version && npm --version` → PASS (`v24.8.0`, npm `11.6.0`).
- `ls "$HOME/.nvm/versions/node"` → PASS; Node `v26.7.0` found.
- `PATH="$HOME/.nvm/versions/node/v26.7.0/bin:$PATH" npm run lint` → PASS (exit `0`, warnings only).
- `PATH="$HOME/.nvm/versions/node/v26.7.0/bin:$PATH" npm run test-migrations` → PASS (exit `0`, 48/48).
- `PATH="$HOME/.nvm/versions/node/v26.7.0/bin:$PATH" npm run packagr` → PASS (exit `0`).
- `PATH="$HOME/.nvm/versions/node/v26.7.0/bin:$PATH" npm run build` → PASS (exit `0`).
- `PATH="$HOME/.nvm/versions/node/v26.7.0/bin:$PATH" npm run test-ci` → PASS (exit `0`, 718/718; coverage 90.75/84.56/90.00/91.32).
- `PATH="$HOME/.nvm/versions/node/v26.7.0/bin:$PATH" npm run build-storybook` → PASS (exit `0`).
- `node --test migrations/test/package-smoke.test.cjs` → PASS (exit `0`, 4/4).
- `node --test migrations/test/engine.test.cjs` → PASS (exit `0`, 13/13).
- `node --test migrations/test/http-migration.test.cjs` → PASS (exit `0`, 21/21).
- `node --test migrations/test/forms-migration.test.cjs` → PASS (exit `0`, 6/6).
- `npm pack --dry-run --json` in clean `dist/` → PASS (exit `0`, 112 entries).
- Packed-content summary script → PASS: 101 migration entries; payload counts HTTP 30, Forms 18, Material Forms 23; all required collection/bridge/engine/manifest/payload paths present.
- Removed-directory assertion for library HTTP/Forms/Material Forms → PASS (exit `0`).
- `rg '@deprecated' src/app/inobeta-ui migrations/update-22/files` → PASS as absence check (no matches).
- `rg '@ngx-formly/core|\bFormly\b|\bformly\b' package.json package-lock.json public_api.ts migrations src` → PASS as absence check (no matches).
- Focused/skipped test marker search under `src` and `migrations` → PASS as absence check (no matches).
- Removed public-symbol search in `dist/types`, `dist/fesm2022`, and `public_api.ts` → PASS as absence check (no matches).
- Canonical Kai Table export search in source and `dist/types/inobeta-ui.d.ts` → PASS.
- Kai Table compatibility-symbol search → FAIL: stale matches in `table.mdx` and `deprecation-guide.md`.
- Added-line explicit-`any` diff search → FAIL: 13 additions in Kai Table specs.
- Packaged no-use collision adversarial check → FAIL (exit `1`, `Preflight failed for HTTP`).
- Packaged malformed-`package.json` rollback check → FAIL (exit `1`; HTTP payload/import edits remain after failure).
- Direct built-adapter runtime probe → SKIPPED as behavior evidence because Node import is blocked by Angular/JSPDF runtime initialization; static implementation difference remains documented.
