
# DEVK-1105 — Correggere l’export di selezione e pagina corrente — Post-implementation feedback

## References

- Original plan: `devk-1105-ticket-short-descriptive-title`.
- Branch reviewed: `fix/DEVK-1105-export-bug` vs `develop/20.0.0`.
- Review date: `2026-08-04`.

## Verdict

**FAIL**

Eight completed steps reviewed: 2 BLOCKER, 2 WARNING, and 0 NIT findings. All eight declared validation executions passed, but runtime dataset validation and legacy export ordering do not satisfy the plan.

## Reviewed steps

### Step 1 — Controllare esplicitamente l’opzione pagina corrente nel dialog

- **Original plan state**: `[DONE]`
- **Acceptance criteria**: 5 / 6 met.
- **Verification commands**: `npm run packagr` — 1 package entry point built / 0 errors.
- **Expected files**:
  - `src/app/inobeta-ui/ui/data-export/data-export.service.ts`
  - `src/app/inobeta-ui/ui/data-export/table-data-export.component.ts`
  - `src/app/inobeta-ui/ui/data-export/table-data-export-dialog.component.ts`
- **Files actually changed**:
  - `src/app/inobeta-ui/ui/data-export/table-data-export.component.ts`
  - `src/app/inobeta-ui/ui/data-export/table-data-export-dialog.component.ts`
- **Issues found**:
  - `[WARNING]` When all three option flags are false, the dialog renders no dataset radio but still initializes `dataset` to `"current"` (`src/app/inobeta-ui/ui/data-export/table-data-export-dialog.component.ts:40,59-68`). Impact: a direct public action or service consumer can submit a hidden, explicitly disabled dataset. Recommendation: represent the no-option state without a dataset value and prevent confirmation, or prevent the dialog from opening when no option is available.
- **Notes**: Flag forwarding, the backward-compatible default, and the `all → selected → current` fallback work when at least one option is visible.

### Step 2 — Abilitare l’export della pagina nel datasource remoto

- **Original plan state**: `[DONE]`
- **Acceptance criteria**: 5 / 5 met.
- **Verification commands**: `npm run packagr` — 1 package entry point built / 0 errors.
- **Expected files**:
  - `src/app/inobeta-ui/ui/kai-table/remote-data-source.ts`
- **Files actually changed**:
  - `src/app/inobeta-ui/ui/kai-table/remote-data-source.ts`
- **Issues found**: none.
- **Notes**: The default readonly set contains only `CurrentPageExport`, remains overridable, and documents the implementation obligation for added capabilities.

### Step 3 — Allineare il renderer mobile alle opzioni disponibili

- **Original plan state**: `[DONE]`
- **Acceptance criteria**: 5 / 5 met.
- **Verification commands**: `npm run packagr` — 1 package entry point built / 0 errors.
- **Expected files**:
  - `src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.ts`
  - `src/app/inobeta-ui/ui/kai-table-mobile/table-mobile-toolbar.component.ts`
- **Files actually changed**:
  - `src/app/inobeta-ui/ui/kai-table-mobile/table-mobile-toolbar.component.ts`
- **Issues found**: none.
- **Notes**: The existing standalone defaults in `table-mobile.component.ts` required no edit. The toolbar now supports all-only and current-only configurations and suppresses the export button when neither is available.

### Step 4 — Normalizzare ed eseguire l’export in IbTable

- **Original plan state**: `[DONE]`
- **Acceptance criteria**: 8 / 11 met.
- **Verification commands**: `npm run packagr` — 1 package entry point built / 0 errors.
- **Expected files**:
  - `src/app/inobeta-ui/ui/kai-table/table.component.ts`
  - `src/app/inobeta-ui/ui/kai-table/table.component.html`
- **Files actually changed**:
  - `src/app/inobeta-ui/ui/kai-table/table.component.ts`
  - `src/app/inobeta-ui/ui/kai-table/table.component.html`
- **Issues found**:
  - `[BLOCKER]` The normalized adapter always supplies `sort: null` and an identity `sortData`, while legacy rows are ordered through `_orderData()` rather than the public legacy `sortData` extension point (`src/app/inobeta-ui/ui/kai-table/table.component.ts:518-548`; `src/app/inobeta-ui/ui/kai-table/table-data-source.ts:42-46,148-150`). Selected rows are consequently exported in `SelectionModel` insertion order, and custom legacy sort implementations are ignored for all/current exports. Impact: exports can differ from the table’s declared order, regressing existing legacy consumers and violating the requirement to preserve ordering. Recommendation: normalize rows using each source’s real sorting contract and preserve sorted selected-row export without re-slicing remote data.
  - `[BLOCKER]` The runtime guard accepts every defined dataset value: `isExportSettings()` checks only for `undefined`, and `canExportDataset()` treats every value other than `"all"` and `"selected"` as `"current"` (`src/app/inobeta-ui/ui/kai-table/table.component.ts:503-516`). Impact: an invalid runtime value can reach `_exportFromTable()`; none of its dataset branches initializes `data`, so `data.map()` throws (`src/app/inobeta-ui/ui/data-export/data-export.service.ts:84-119`). Recommendation: validate the exact `all | selected | current` union before capability checks and reject malformed requests without invoking the service.
- **Notes**: Capability gating, action suppression, selected-row forwarding, remote current-page reuse, local page slicing, column transformation support, and removal of the unsafe production datasource cast are otherwise present.

### Step 5 — Coprire il dialog export con test unitari

- **Original plan state**: `[DONE]`
- **Acceptance criteria**: 5 / 5 met.
- **Verification commands**: `ng test --include='src/app/inobeta-ui/ui/data-export/table-data-export.component.spec.ts' --include='src/app/inobeta-ui/ui/data-export/table-data-export-dialog.component.spec.ts' --watch=false` — 7 pass / 0 fail / 0 skipped.
- **Expected files**:
  - `src/app/inobeta-ui/ui/data-export/table-data-export.component.spec.ts`
  - `src/app/inobeta-ui/ui/data-export/table-data-export-dialog.component.spec.ts`
- **Files actually changed**:
  - `src/app/inobeta-ui/ui/data-export/table-data-export.component.spec.ts`
  - `src/app/inobeta-ui/ui/data-export/table-data-export-dialog.component.spec.ts`
- **Issues found**: none.
- **Notes**: The declared forwarding, visibility, backward-default, and initial-dataset scenarios are covered.

### Step 6 — Coprire export desktop e datasource remoto

- **Original plan state**: `[DONE]`
- **Acceptance criteria**: 7 / 8 met.
- **Verification commands**: `ng test --include='src/app/inobeta-ui/ui/kai-table/table.component.spec.ts' --include='src/app/inobeta-ui/ui/kai-table/remote-data-source.spec.ts' --watch=false` — 82 pass / 0 fail / 0 skipped.
- **Expected files**:
  - `src/app/inobeta-ui/ui/kai-table/table.component.spec.ts`
  - `src/app/inobeta-ui/ui/kai-table/remote-data-source.spec.ts`
- **Files actually changed**:
  - `src/app/inobeta-ui/ui/kai-table/table.component.spec.ts`
  - `src/app/inobeta-ui/ui/kai-table/remote-data-source.spec.ts`
- **Issues found**:
  - `[WARNING]` The non-first-page legacy test uses naturally ordered data and activates no sort, while the selected-row test selects rows in their displayed order (`src/app/inobeta-ui/ui/kai-table/table.component.spec.ts:270-329`). Impact: the suite passes even though active/custom legacy sorting and selected-row ordering are discarded by the production adapter. Recommendation: add assertions using an active or custom legacy sorter and selection order that differs from table order.
- **Notes**: Remote capability, option visibility, loaded-page reuse, no-extra-fetch behavior, unsupported remote modes, page-count gating, and page-size updates are covered.

### Step 7 — Coprire il gating export mobile

- **Original plan state**: `[DONE]`
- **Acceptance criteria**: 5 / 5 met.
- **Verification commands**: `ng test --include='src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.spec.ts' --watch=false` — 15 pass / 0 fail / 0 skipped.
- **Expected files**:
  - `src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.spec.ts`
- **Files actually changed**:
  - `src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.spec.ts`
- **Issues found**: none.
- **Notes**: All-only, current-only, no-option, and selected-hidden configurations pass independently.

### Step 8 — Rendere verificabile l’export nell’esempio API

- **Original plan state**: `[DONE]`
- **Acceptance criteria**: 5 / 5 met.
- **Verification commands**: `npm run build` — 4 initial chunks / 1 lazy chunk / 0 errors.
- **Expected files**:
  - `src/app/examples/kai-table-example/server-side/kai-table-api-example.ts`
- **Files actually changed**:
  - `src/app/examples/kai-table-example/server-side/kai-table-api-example.ts`
- **Issues found**: none.
- **Notes**: The direct export component was replaced by the capability-aware `ibTableAction` marker without changing fetching, filters, sorting, refresh, error handling, or visible text.

## Files outside the plan scope

None in the staged DEVK-1105 implementation delta.

The exact diff against local `develop/20.0.0` also contains 38 upstream-only files from merge commit `5b93e68`; current `HEAD` equals `origin/develop/20.0.0`. Those files predate the staged DEVK-1105 work and were not attributed as implementation scope violations.

## Scope Check

The staged production, example, and spec files stay within their respective step boundaries. The original plan document is treated as the review source. No `public_api.ts`, translation, provider, NgRx, HTTP protocol, Storybook, or unrelated application file was changed by the DEVK-1105 delta.

## Convention Violations

None found. The changed templates introduce no TypeScript casts, unsafe nullable access, or untranslated visible strings. No public barrel was changed unnecessarily.

## Missing Validation

None. Every validation command declared by Steps 1–8 was run exactly as written and completed with exit code 0.

The green Step 6 command does not cover active/custom ordering, as recorded in its `[WARNING]`; the command result therefore does not disprove the ordering BLOCKER.

## Remediation plan

### Remediation 1 — Preserve export ordering contracts [agent: general] [model: `openai/gpt-5.6-sol`] ✅ DONE

~~~
## TASK:
Preserve active and custom sorting for all, current, and selected exports.

## CONTEXT:
`src/app/inobeta-ui/ui/kai-table/table.component.ts:518-548` creates an adapter with no active sort and orders legacy data through `_orderData()`. This bypasses the public legacy `sortData` extension at `src/app/inobeta-ui/ui/kai-table/table-data-source.ts:42-46`, and selected rows are never sorted.

## OBJECTIVE:
Export each supported dataset in the table’s effective order while retaining source-aware pagination and remote-page behavior.

## REQUIREMENTS:
1. Normalize modern local, legacy local, and remote rows using their actual sorting contracts.
2. Preserve custom legacy `sortData` behavior for all and current exports.
3. Ensure selected rows are exported in effective table order while still sourcing membership directly from `selectionColumn().selection.selected`.
4. Keep current-page slicing after ordering for local and legacy sources.
5. Keep remote current export on the already loaded `filteredData` without another slice or request.
6. Add tests with an active/custom legacy sorter and selection insertion order different from table order.

## CONSTRAINTS:
- Do not change export providers, remote request behavior, public APIs, NgRx, filters, aggregations, or translations.
- Do not reintroduce the unsafe `IbTableDataSource<unknown>` cast in the production export path.
- Do not weaken existing assertions.

## OUTPUT:
Report the normalization change, ordering cases covered, files modified, and exact verification result.

## ACCEPTANCE CRITERIA:
- `ng test --include='src/app/inobeta-ui/ui/kai-table/table.component.spec.ts' --include='src/app/inobeta-ui/ui/kai-table/remote-data-source.spec.ts' --watch=false` passes with 0 failures.
- A custom legacy sorter controls all/current export order.
- Selected rows are exported in effective table order even when selected in another order.
- Remote current export still performs no additional fetch or client-side page slice.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 2 — Reject malformed dataset values [agent: general] [model: `openai/gpt-5.6-sol`] ✅ DONE

~~~
## TASK:
Make the runtime export guard accept only the three supported dataset values.

## CONTEXT:
`src/app/inobeta-ui/ui/kai-table/table.component.ts:503-516` accepts any defined dataset and falls through to current-page capability checks. An invalid value can reach `src/app/inobeta-ui/ui/data-export/data-export.service.ts:84-119`, where `data` remains uninitialized before `map()`.

## OBJECTIVE:
Ignore malformed export settings safely and never invoke the export service for an unknown dataset.

## REQUIREMENTS:
1. Validate that `dataset` is exactly `"all"`, `"selected"`, or `"current"`.
2. Preserve the existing capability checks for valid values.
3. Do not invoke `_exportFromTable()` for malformed settings.
4. Add a public-behavior Jasmine test that supplies an invalid runtime dataset and asserts no service call and no thrown error.

## CONSTRAINTS:
- Do not broaden `IDataExportSettings`.
- Do not alter valid export behavior or provider formats.
- Do not use `any`, `fit`, or `fdescribe`.

## OUTPUT:
Report the guard change, added regression test, and exact focused-test result.

## ACCEPTANCE CRITERIA:
- `ng test --include='src/app/inobeta-ui/ui/kai-table/table.component.spec.ts' --include='src/app/inobeta-ui/ui/kai-table/remote-data-source.spec.ts' --watch=false` passes with 0 failures.
- An unknown runtime dataset does not reach `_exportFromTable()`.
- Valid all, selected, and current requests retain their existing capability behavior.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 3 — Handle the no-option dialog state [agent: general] [model: `openai/gpt-5.6-sol`] ✅ DONE

~~~
## TASK:
Prevent the shared export dialog from submitting a hidden dataset when every option is disabled.

## CONTEXT:
`src/app/inobeta-ui/ui/data-export/table-data-export-dialog.component.ts:40,59-68` renders no radios when all flags are false but initializes the form with `"current"`.

## OBJECTIVE:
Ensure the dialog never contains or submits a dataset value corresponding to a hidden option.

## REQUIREMENTS:
1. Represent the all-options-disabled state without selecting `"all"`, `"selected"`, or `"current"`.
2. Prevent export confirmation while no dataset is available.
3. Preserve the backward-compatible omitted-`showCurrentPageOption` behavior.
4. Preserve the existing first-visible order for valid configurations.
5. Add a Jasmine test for the all-options-disabled state and keep the existing visibility/default tests.

## CONSTRAINTS:
- Add no visible strings or translation keys.
- Do not change dataset values, providers, formats, or `public_api.ts`.
- Do not alter normal standalone defaults.

## OUTPUT:
Report the no-option behavior, changed tests, and exact verification result.

## ACCEPTANCE CRITERIA:
- `ng test --include='src/app/inobeta-ui/ui/data-export/table-data-export.component.spec.ts' --include='src/app/inobeta-ui/ui/data-export/table-data-export-dialog.component.spec.ts' --watch=false` passes with 0 failures.
- The all-options-disabled form has no hidden dataset selection and cannot confirm export.
- Omitted `showCurrentPageOption` still exposes and selects current when no earlier option is visible.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

## Commands executed during this review

- `git status --short --branch && git branch --show-current && git rev-parse --verify "develop/20.0.0" && git diff --name-status "develop/20.0.0"...HEAD && git diff --stat "develop/20.0.0"...HEAD && git log --oneline --decorate -10` → PASS.
- `git diff --check "develop/20.0.0"...HEAD` → PASS.
- `git diff --name-status "develop/20.0.0" && git diff --stat "develop/20.0.0" && git diff --cached --name-status && git diff --cached --stat && git merge-base "develop/20.0.0" HEAD && git rev-parse "origin/develop/20.0.0"` → PASS.
- `git diff --check "develop/20.0.0" && git diff --cached --check` → PASS.
- `git diff --cached -- <reviewed implementation and spec files>` → PASS.
- `npm run packagr` (Step 1) → PASS (1 package entry point, 0 errors).
- `npm run packagr` (Step 2) → PASS (1 package entry point, 0 errors).
- `npm run packagr` (Step 3) → PASS (1 package entry point, 0 errors).
- `npm run packagr` (Step 4) → PASS (1 package entry point, 0 errors).
- `ng test --include='src/app/inobeta-ui/ui/data-export/table-data-export.component.spec.ts' --include='src/app/inobeta-ui/ui/data-export/table-data-export-dialog.component.spec.ts' --watch=false` → PASS (7 pass / 0 fail / 0 skipped).
- `ng test --include='src/app/inobeta-ui/ui/kai-table/table.component.spec.ts' --include='src/app/inobeta-ui/ui/kai-table/remote-data-source.spec.ts' --watch=false` → PASS (82 pass / 0 fail / 0 skipped).
- `ng test --include='src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.spec.ts' --watch=false` → PASS (15 pass / 0 fail / 0 skipped).
- `npm run build` → PASS (4 initial chunks / 1 lazy chunk / 0 errors).
- `git status --short --branch && git diff --cached --check && git diff --check` → PASS.
- `git diff --name-only "origin/develop/20.0.0" && git diff --name-only "develop/20.0.0"` → PASS.
- `git show --name-status --format=fuller --no-renames HEAD` → PASS.
PLAN>>>
