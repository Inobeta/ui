# DEVK-912 — Decouple Kai-Table from Views Module — Post-implementation feedback

## References
- Original plan: `docs/plans/DEVK-912-decouple-table-views.md`.
- Branch reviewed: `refactor/DEVK-912-views-unlink` vs `origin/develop` (unavailable locally; `develop` was also unavailable). Review used the staged workspace diff.
- Review date: `2026-07-17`.

## Verdict
**FAIL**

10 planned steps were reviewed. The TypeScript dependency decoupling and package build succeed, but the SCSS host-class selector is attached to the wrong element, so the views toolbar styling regresses. There are 1 BLOCKER, 2 WARNING, and 1 NIT findings.

## Reviewed steps

### Step 1 — Create `IbTableViewsHost` abstraction in kai-table
- **Original plan state**: `[DONE]`.
- **Acceptance criteria**: 5 / 5 passed.
- **Verification commands**: 3 pass / 0 fail / 0 skipped.
- **Expected files**: `table-views-host.ts`, `index.ts`.
- **Files actually changed** (staged workspace diff): `table-views-host.ts`, `index.ts`.
- **Issues found**:
  - `[NIT]` `table-views-host.ts:52` uses `Portal<any>[]`, contrary to the plan’s “no `any` types” requirement. This was prescribed by the proposed contract, so it is low risk.

### Step 2 — Refactor `IbTableViewGroup` to extend `IbTableViewsHost`
- **Original plan state**: `[DONE]`.
- **Acceptance criteria**: 3 / 3 passed.
- **Verification commands**: 2 pass / 0 fail / 0 skipped.
- **Expected files**: `table-view-group.component.ts`, `table-view-group.component.html`.
- **Files actually changed** (staged workspace diff): `table-view-group.component.ts`; no template change was needed.
- **Issues found**: None.

### Step 3 — Refactor `IbTableDataSource` to use `IbTableViewsHost`
- **Original plan state**: `[DONE]`.
- **Acceptance criteria**: 5 / 5 passed.
- **Verification commands**: 3 pass / 0 fail / 0 skipped.
- **Expected files**: `table-data-source.ts`.
- **Files actually changed** (staged workspace diff): `table-data-source.ts`.
- **Issues found**: None.

### Step 4 — Refactor `IbTable` component to use `IbTableViewsHost`
- **Original plan state**: `[DONE]`.
- **Acceptance criteria**: 6 / 6 passed.
- **Verification commands**: 3 pass / 0 fail / 0 skipped.
- **Expected files**: `table.component.ts`.
- **Files actually changed** (staged workspace diff): `table.component.ts`.
- **Issues found**: None.

### Step 5 — Update SCSS to remove `ib-table-view-group` element selector dependency
- **Original plan state**: `[DONE]`.
- **Acceptance criteria**: 1 / 2 passed.
- **Verification commands**: 2 pass / 1 fail / 0 skipped.
- **Expected files**: `table.component.scss`.
- **Files actually changed** (staged workspace diff): `table.component.scss`.
- **Issues found**:
  - `[BLOCKER]` `table.component.scss:36` applies `.ib-table--has-views` to `.ib-table__toolbar`, while `@HostBinding` adds that class to the `ib-kai-table` host (`table.component.ts:190`). Consequently the selector never matches and a projected views host no longer gives the toolbar its required `height` and `border-bottom`. This fails the step objective and causes a visual regression.

### Step 6 — Update `IbTable` unit tests (remove views coupling)
- **Original plan state**: `[DONE]`.
- **Acceptance criteria**: 2 / 3 passed.
- **Verification commands**: 0 pass / 1 fail / 0 skipped.
- **Expected files**: `table.component.spec.ts`, optional `*.stub.spec.ts`.
- **Files actually changed** (staged workspace diff): `table.component.spec.ts`, `table-views-host.stub.spec.ts`.
- **Issues found**:
  - `[WARNING]` The targeted table spec fails: 9 failures / 7 successes / 3 skipped. Angular raises `NG0701` because Italian locale data is absent for `DecimalPipe`/`DatePipe`. The plan requires all tests in this file to pass, so this validation cannot be accepted.
  - `[WARNING]` The new host integration test only asserts ContentChild resolution. It does not verify the required contract calls (`setViewDataAccessor`, `setViewGroupName`, `handleStateChanges`) or that host emissions restore table state.

### Step 7 — Move view-specific tests to views module
- **Original plan state**: `[DONE]`.
- **Acceptance criteria**: 3 / 3 passed.
- **Verification commands**: 1 pass / 0 fail / 0 skipped.
- **Expected files**: `table-view-group.component.spec.ts`.
- **Files actually changed** (staged workspace diff): `table-view-group.component.spec.ts`.
- **Issues found**: None. The focused suite passes 19 tests, although Karma reports two existing/new no-expectation warnings for save tests.

### Step 8 — Update public API and barrel exports
- **Original plan state**: `[DONE]`.
- **Acceptance criteria**: 2 / 2 passed.
- **Verification commands**: 1 pass / 0 fail / 0 skipped.
- **Expected files**: `index.ts`, `public_api.ts`.
- **Files actually changed** (staged workspace diff): `index.ts`; `public_api.ts` correctly already re-exports the barrel.
- **Issues found**: None. `npm run packagr` succeeds.

### Step 9 — Update examples (if needed)
- **Original plan state**: `[DONE]`.
- **Acceptance criteria**: 1 / 2 passed.
- **Verification commands**: 1 pass / 0 fail / 1 skipped.
- **Expected files**: no expected change unless required.
- **Files actually changed** (staged workspace diff): none.
- **Issues found**: None. Production build passes; `npm start` visual verification was not run.

### Step 10 — Update Storybook stories (if needed)
- **Original plan state**: `[DONE]`.
- **Acceptance criteria**: 0 / 2 passed.
- **Verification commands**: 0 pass / 0 fail / 2 skipped.
- **Expected files**: `table.stories.ts`, `table.mdx`, optional `deprecation-guide.md`.
- **Files actually changed** (staged workspace diff): `table.mdx`.
- **Issues found**: None. The MDX correctly documents `IbViewModule` as optional; Storybook was not started or built.

## Files outside the plan scope

- `[WARNING]` `.opencode/package.json` — unrelated configuration modification with no justification in DEVK-912.
- `[WARNING]` `.opencode/package-lock.json` — unrelated generated dependency lockfile with no justification in DEVK-912.

## Remediation plan

### Remediation 1 — Correct views toolbar selector [agent: kai-table-executor] [model: github-copilot/gpt-5.6-terra]

**Observed problem**: `[BLOCKER]` The host class is bound to `ib-kai-table`, but `table.component.scss` matches it only on the nested toolbar, so views styling is never applied.

**Original step**: 5 — Update SCSS to remove `ib-table-view-group` element selector dependency.

**Prompt for the agent**:
~~~
## TASK:
Correct the DEVK-912 views toolbar class selector.

## CONTEXT:
Repo: inobeta-ui. `IbTable` binds `ib-table--has-views` to its host in `src/app/inobeta-ui/ui/kai-table/table.component.ts`. The SCSS in `table.component.scss` currently checks that class on `.ib-table__toolbar`, which cannot match.

## OBJECTIVE:
When an `IbTableViewsHost` is projected, the host class must cause the nested table toolbar to receive the existing 56px height and bottom border, without restoring an `ib-table-view-group` element selector dependency.

## REQUIREMENTS:
1. Modify only `src/app/inobeta-ui/ui/kai-table/table.component.scss`.
2. Make the selector match the class on the `ib-kai-table` / `.ib-table__container` host and target its nested `.ib-table__toolbar`.
3. Preserve the existing `:has(> section:not(:empty))` toolbar fallback and its declarations.
4. Do not alter colors, custom properties, or unrelated rules.

## CONSTRAINTS:
- Do not modify TypeScript, tests, templates, public API, or views module files.
- Do not reintroduce `ib-table-view-group` in the SCSS.

## OUTPUT:
Return the changed file path and a concise description of the selector relationship.

## ACCEPTANCE CRITERIA:
- `grep "ib-table-view-group" src/app/inobeta-ui/ui/kai-table/table.component.scss` returns no matches.
- The stylesheet contains a selector in which `.ib-table--has-views` on the table host targets `.ib-table__toolbar`.
- `npm run build` completes successfully.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 2 — Restore table-spec validation [agent: unit-jasmine-executor] [model: github-copilot/gpt-5.6-terra]

**Observed problem**: `[WARNING]` `table.component.spec.ts` fails under its planned targeted command because the TestBed lacks Italian locale data for number/date pipes. The new host contract is also only tested for discovery, not interactions.

**Original step**: 6 — Update `IbTable` unit tests (remove views coupling).

**Prompt for the agent**:
~~~
## TASK:
Make DEVK-912 table component tests pass and cover the views-host integration contract.

## CONTEXT:
Repo: inobeta-ui. The focused table spec command fails with `NG0701: Missing locale data for the locale "it"` from number/date pipes. The spec now projects `IbTestViewsHostComponent`, a stub extending `IbTableViewsHost`.

## OBJECTIVE:
The table component spec must run cleanly without `IbViewModule`, while verifying that the table initializes and wires the abstract views host.

## REQUIREMENTS:
1. Modify only `src/app/inobeta-ui/ui/kai-table/table.component.spec.ts` and, if necessary, `table-views-host.stub.spec.ts`.
2. Provide locale setup in the test path consistent with repository conventions so all focused specs pass.
3. Add assertions that the table calls the host initialization methods and that an `activeViewChanged` emission applies the expected table state or URL-state dispatch.
4. Preserve the no-`IbViewModule` / no-views-module-import condition.
5. Do not alter production source.

## CONSTRAINTS:
- Do not reintroduce `IbViewModule` or `IbTableViewGroup` into the kai-table spec.
- Do not use focused Jasmine tests.
- Do not remove existing non-views coverage.

## OUTPUT:
Return changed paths and the focused test command result.

## ACCEPTANCE CRITERIA:
- `npx ng test --include=src/app/inobeta-ui/ui/kai-table/table.component.spec.ts --watch=false --code-coverage=false` completes with zero failures.
- `grep "IbViewModule" src/app/inobeta-ui/ui/kai-table/table.component.spec.ts` returns no matches.
- The test suite asserts views-host initialization and active-view handling.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

## Commands executed during this review

- `git status --short && git branch --show-current && git diff --name-status origin/develop...HEAD && git diff --stat origin/develop...HEAD && git log --oneline -10` → FAIL (`origin/develop` unavailable).
- `git rev-parse --verify origin/develop` → FAIL (reference unavailable).
- `git rev-parse --verify develop && git diff --name-status develop ...` → FAIL (`develop` unavailable).
- `git diff --cached --check` → FAIL (pre-existing trailing whitespace in the added original plan at line 315).
- `npm run build` → PASS.
- `npx ng test --include=src/app/inobeta-ui/ui/kai-table/table.component.spec.ts --watch=false --code-coverage=false` → FAIL (9 failures: missing Italian locale data).
- `npx ng test --include=src/app/inobeta-ui/ui/views/components/table-view-group/table-view-group.component.spec.ts --watch=false --code-coverage=false` → PASS (19 tests; 2 no-expectation warnings).
- `npm run packagr` → PASS.
- `npm run lint` → FAIL (project has no configured `lint` target).
- Static searches for views imports, host usage, legacy test coupling, and changed selectors → PASS, except the stylesheet inspection identified the host/toolbar selector mismatch.
- `npm start` manual example verification → SKIPPED (not run).
- `npm run storybook` → SKIPPED (not run).
