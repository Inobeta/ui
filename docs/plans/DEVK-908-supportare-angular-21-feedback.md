# DEVK-908 — Supportare Angular 21 — Post-implementation feedback

## References
- Original plan: `docs/plans/DEVK-908-supportare-angular-21.md`.
- Branch reviewed: `develop/21.0.0` vs `origin/develop/21.0.0` (matching remote release branch; `origin/develop` does not exist).
- Review date: `2026-08-05`.

## Verdict
**FAIL**

High risk: 1 review unit assessed, with 4 BLOCKER, 2 WARNING, and 0 NIT. Two of four high-level acceptance criteria pass: route URLs and absence of unrelated maintained-component logic pass; the command chain and integrated preservation/check completeness fail because sorting is broken and the Storybook selector is skipped.

## Reviewed steps

### Step 14 — Verificare la release candidate v21
- **Original plan state**: not marked `[DONE]`; this is a review unit.
- **Acceptance criteria**: 2 / 4 high-level criteria passed.
- **Verification commands**: 4 pass / 5 fail / 0 skipped. Storybook exited 0 but failed functional acceptance.
- **Expected files**: broad read-only review scope: `package.json`, lock/config files, `public_api.ts`, `src/`, `.storybook/`, and tsconfigs.
- **Files actually changed** (diff vs matching remote release branch): planned package/config and `public_api.ts` migration changes; navigation, uploader, Kai Table sorting, examples/side-menu, Storybook, and spec changes; the original plan; plus `.opencode/agents/storybook-executor.md` outside scope. The implementation diff spans about 98 files, so categories are listed instead of every path.
- **Issues found**:
  - `[BLOCKER]` Lint cannot run: `package.json:9` invokes `ng lint`, but `angular.json` has no lint target near its test/Storybook targets. Impact: explicit lint-exit-0 acceptance cannot pass. Recommendation: restore an executable target without weakening lint.
  - `[BLOCKER]` Kai Table production sorting is broken. Maintained templates use `mat-sort-header`, but projected/dynamic `IbTable` columns no longer receive a parent `MatSort` after local `matSort` and workaround removal (`src/app/inobeta-ui/ui/kai-table/columns/column.ts:35-46`, `src/app/inobeta-ui/ui/kai-table/columns/date-column.ts:23-34`, `src/app/inobeta-ui/ui/kai-table/columns/number-column.ts:25-37`, `src/app/inobeta-ui/ui/kai-table/columns/text-column.ts:23-35`). This causes 73 `MatSortHeader must be placed within a parent element with the MatSort directive` failures, concentrated in `src/app/inobeta-ui/ui/kai-table/table.component.spec.ts` and `src/app/examples/kai-table-example/kai-table-full-example.spec.ts:52`. Recommendation: use public Angular Material APIs only; do not restore `IbSortHeader` or access protected/private `_sort`.
  - `[BLOCKER]` CI has 94 failures and no valid ≥80% coverage result. Beyond 73 sorting failures, 21 Angular 21 NG0100 failures include `src/app/inobeta-ui/ui/kai-table/cells.spec.ts:139`, `src/app/inobeta-ui/ui/kai-table/action.spec.ts:57`, `src/app/inobeta-ui/ui/kai-table/columns/date-column.spec.ts:61`, `src/app/inobeta-ui/ui/kai-table/columns/number-column.spec.ts:90`, `src/app/inobeta-ui/ui/kai-table/columns/column.spec.ts:165,186`, `src/app/inobeta-ui/ui/kai-table/columns/text-column.spec.ts:53`, `src/app/inobeta-ui/ui/views/components/table-view-group/table-view-group.component.spec.ts:163`, and `src/app/inobeta-ui/ui/material-forms/material-form/material-form.component.spec.ts:281`. Unit 13 is therefore not actually green.
  - `[BLOCKER]` Storybook skips the required version-selector addon twice: `Could not resolve addon "./version-selector", skipping. Is it installed?` (`.storybook/main.ts:11`). Exit 0 does not satisfy acceptance because the selector is not bundled. Other Vite `keepNames`/chunk warnings are non-blocking.
  - `[WARNING]` Sorting coverage bypasses actual integration: it calls `host.matSort.sort(...)` on a raw Material table instead of activating/clicking an `IbColumn` header (`src/app/inobeta-ui/ui/kai-table/columns/column.spec.ts:307-364`). It cannot detect broken `IbColumn` DI registration.
  - `[WARNING]` Scope drift: `.opencode/agents/storybook-executor.md:60` changed outside Unit 14 and implementation-plan boundaries. Side-menu files also landed under `src/app/examples/side-menu/`, not Step 8's declared `src/app/examples/nav/side-menu.component.*`; behavior is correct, but the executor allowed-file boundary was crossed.
- **Notes**: `npm run packagr` and production app build pass Angular 21. Main Menu/Breadcrumb production folders and exports are removed; uploader legacy/module is removed; `IbSortHeader` and `ibSortHeaderFor` are absent from production; `@storybook/blocks` is absent from active imports/dependencies; no protected/private `MatSortHeader._sort` access exists. Historical mentions in `src/whats_new.mdx` are acceptable; `table-data-source.ts` owns an unrelated private `_sort`. Exactly one canonical `IbUploaderComponent` remains at `src/app/inobeta-ui/ui/uploader/uploader.component.ts:14`, matching maintained uploader-v20. `IbFilterPipe` remains non-deprecated; `IbToolTestModule` remains deprecated after v22. Route and side-menu unique sets match at 16 URLs, with no missing/added URL; only breadcrumb metadata was removed. No unrelated maintained-component production logic changed beyond planned navigation/uploader/sorting work; sorting is related but incorrect.

## Files outside the plan scope

- `[WARNING]` `.opencode/agents/storybook-executor.md` — unrelated agent documentation change outside allowed boundaries.
- `[RESOLVED EXCEPTION]` `src/app/examples/side-menu/` — accepted as the Step 8 boundary exception. The dedicated feature folder is already referenced only by the navigation example and preserves the reviewed route/menu URL set; relocation is not required and would add path-only churn.

## Convention Violations

- Kai Table projected/dynamic headers violate Angular Material's public `MatSort`/`MatSortHeader` parent-registration contract.
- No additional i18n or Angular template-safety violation was established.

## Missing Validation

- No green lint result because the target is missing.
- No green CI run or valid ≥80% statements/lines/branches/functions coverage result.
- No test exercises a real sortable `IbColumn` header.
- Storybook version-selector inclusion is unverified because the addon is skipped.

## Remediation plan

### Remediation 1 — Restore supported Kai Table MatSort registration [agent: kai-table-executor] [model: `openai/gpt-5.6-sol`] ✅ DONE [2026-08-05T15:50:34.481Z]

**Observed problem**: Actual projected/dynamic `IbColumn` headers lack supported parent `MatSort` registration, causing production and test failures.

**Original step**: 14 — Verificare la release candidate v21.

**Prompt for the agent**:

~~~
## TASK:
Restore supported MatSort registration for projected/dynamic Kai Table columns.

## CONTEXT:
Angular 21 reports `MatSortHeader must be placed within a parent element with the MatSort directive` from maintained column templates under `src/app/inobeta-ui/ui/kai-table/columns/`.

## OBJECTIVE:
Make actual `IbColumn` sortable headers register with the table's `MatSort` while preserving behavior.

## REQUIREMENTS:
1. Change only Kai Table production files needed under `src/app/inobeta-ui/ui/kai-table/`.
2. Use public Angular Material APIs.
3. Preserve projected/dynamic columns and sorting semantics.
4. Run targeted Kai Table specs and `npm run packagr`.

## CONSTRAINTS:
Do not restore `IbSortHeader`, access protected/private `_sort`, edit specs/examples, or refactor unrelated table logic.

## OUTPUT:
Return changed files, registration approach, and validation results.

## ACCEPTANCE CRITERIA:
Targeted Kai Table specs pass without MatSort parent errors; `npm run packagr` exits 0.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 2 — Stabilize Angular 21 Jasmine suite and real sorting coverage [agent: unit-jasmine-executor] [model: `openai/gpt-5.6-sol`] ✅ DONE [2026-08-05T16:02:28.455Z]

**Observed problem**: 21 NG0100 failures remain, and current sorting coverage bypasses real `IbColumn` header integration.

**Original step**: 14 — Verificare la release candidate v21.

**Prompt for the agent**:

~~~
## TASK:
Stabilize Angular 21 Jasmine setup/timing and add real Kai Table sortable-header coverage.

## CONTEXT:
`npm run test-ci` reports 94 failures: 73 sorting failures and 21 NG0100 failures. Existing `column.spec.ts` calls `host.matSort.sort(...)` directly.

## OBJECTIVE:
Make test setup Angular 21-safe and verify sorting via an actual `IbColumn` header.

## REQUIREMENTS:
1. Modify `**/*.spec.ts` and `**/*.stub.spec.ts` only.
2. Fix NG0100 failures through correct fixture setup/lifecycle timing.
3. Activate/click an actual sortable `IbColumn` header and assert active column and direction.
4. Run affected specs, then `npm run test-ci`.
5. Confirm all coverage dimensions are at least 80%.

## CONSTRAINTS:
Do not edit production code, suppress errors, disable/focus tests, lower thresholds, or hide a production sorting defect.

## OUTPUT:
Return changed specs, failures addressed, test result, and coverage totals.

## ACCEPTANCE CRITERIA:
Affected specs and `npm run test-ci` pass with 0 failures; real header interaction is asserted; statements, lines, branches, and functions are each ≥80%.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 3 — Restore executable lint target [agent: task-executor] [model: `openai/gpt-5.6-sol`] ✅ DONE [2026-08-05T16:06:35.898Z]

**Observed problem**: `npm run lint` invokes `ng lint`, but `angular.json` has no lint target.

**Original step**: 14 — Verificare la release candidate v21.

**Prompt for the agent**:

~~~
## TASK:
Restore an executable Angular 21 lint target.

## CONTEXT:
`package.json:9` runs `ng lint`; `angular.json` lacks the target and returns `Cannot find "lint" target for the specified project.`

## OBJECTIVE:
Make `npm run lint` execute project lint rules and exit successfully.

## REQUIREMENTS:
1. Change only `package.json`, `package-lock.json`, `angular.json`, and lint config if required.
2. Configure a supported Angular 21 lint toolchain.
3. Preserve or strengthen existing lint coverage/rules.
4. Run `npm run lint`.

## CONSTRAINTS:
Do not weaken rules, add broad ignores, edit source, or alter unrelated scripts/config.

## OUTPUT:
Return changed files, selected tooling, and command result.

## ACCEPTANCE CRITERIA:
`npm run lint` runs intended project linting and exits 0 without a missing-target error.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 4 — Register Storybook 10 version selector correctly [agent: storybook-executor] [model: `openai/gpt-5.6-sol`] ✅ DONE [2026-08-05T16:10:37.436Z]

**Observed problem**: Storybook cannot resolve `./version-selector`, skips it, and omits required functionality despite exit 0.

**Original step**: 14 — Verificare la release candidate v21.

**Prompt for the agent**:

~~~
## TASK:
Register the local version-selector addon in a Storybook 10-supported form.

## CONTEXT:
`.storybook/main.ts:11` references `./version-selector`, but Storybook warns twice that it cannot resolve and skips the addon.

## OBJECTIVE:
Build Storybook with the version selector resolved and bundled.

## REQUIREMENTS:
1. Change `.storybook/version-selector/` and `.storybook/main.ts`; change dependency config only if necessary.
2. Add/correct a resolvable Storybook 10 addon preset/manager entry.
3. Preserve selector behavior and other addons.
4. Run `npm run build-storybook` and verify selector code in generated output.

## CONSTRAINTS:
Do not remove the selector, silence the warning without registration, or modify unrelated stories/application code.

## OUTPUT:
Return changed files, registration mechanism, build result, and inclusion evidence.

## ACCEPTANCE CRITERIA:
Build exits 0 without the version-selector skip warning, and selector code is present in generated Storybook output.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 5 — Remove implementation-scope drift [agent: task-executor] [model: `openai/gpt-5.6-sol`] ✅ DONE [2026-08-05T16:11:28.392Z]

**Observed problem**: Unrelated agent documentation changed; side-menu path crossed Step 8's declared boundary although behavior is correct.

**Original step**: 14 — Verificare la release candidate v21.

**Prompt for the agent**:

~~~
## TASK:
Remove unrelated scope drift and resolve the side-menu path exception conservatively.

## CONTEXT:
`.opencode/agents/storybook-executor.md:60` changed outside plan scope. Side-menu files are under `src/app/examples/side-menu/`, while Step 8 declared `src/app/examples/nav/side-menu.component.*`.

## OBJECTIVE:
Leave only justified release changes without disrupting correct route/menu behavior.

## REQUIREMENTS:
1. Revert only the unrelated `.opencode/agents/storybook-executor.md` change.
2. Record a side-menu boundary exception through applicable process if allowed.
3. Move side-menu files only if strict plan enforcement requires it.
4. If source paths change, update only required references and run `npm run build`.

## CONSTRAINTS:
Do not modify the original plan, change route/menu behavior, move code for cosmetics, or revert planned release work.

## OUTPUT:
Return reverted scope-only file, side-menu boundary disposition, source references changed, and validation result.

## ACCEPTANCE CRITERIA:
Unrelated agent-file diff is absent; side-menu boundary is explicitly resolved without URL/menu changes; `npm run build` exits 0 if source paths changed.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

## Commands executed during this review

Authoritative supplied results below; no review commands were rerun while authoring this report.

- `git status --short --branch && git branch --show-current && git rev-parse --verify origin/develop && git log --oneline --decorate -10` → FAIL (absent `origin/develop`; matching `origin/develop/21.0.0` then established).
- `git diff --name-status origin/develop...HEAD && git diff --stat origin/develop...HEAD` → FAIL (absent `origin/develop`).
- `npm run lint && npm run packagr && npm run build && npm run test-ci && npm run build-storybook` → FAIL immediately at lint: `Cannot find "lint" target for the specified project.`
- `npm run packagr` → PASS.
- `npm run build` → PASS.
- `npm run test-ci` → FAIL: `TOTAL: 94 FAILED, 681 SUCCESS`; no valid coverage result; 73 sorting failures and 21 NG0100 failures.
- `npm run build-storybook` → FAIL functional acceptance (exit 0, but version-selector skip warning appears twice and selector is omitted; other Vite warnings are non-blocking).
- Route/menu comparison script → PASS after unique-set comparison: 16 URLs, none missing/added; initial multiset mismatch only reflected old JSON group/child duplicates; routing paths, redirects, and components remain.
- `git diff --check origin/develop/21.0.0` → PASS.
