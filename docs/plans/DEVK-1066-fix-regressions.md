1: # DEVK-1066 — Fix regressions in kai-table (table.component.ts)

1. Goal
   - Fix regressions that prevent data loading and break sorting/filtering in IbKaiTable (table.component.ts).
   - Add targeted console.log traces to make root cause reproducible during review.

2. Current State
   - File inspected: src/app/inobeta-ui/ui/kai-table/table.component.ts (see repo).
   - Observations:
     - Data flow split between legacy dataSource shim and new signals (_data, _remoteRows).
     - renderedRows computed relies on multiple signals and remoteSource check.
     - sortChange only dispatches URL state; no direct local fallback observed.
     - displayedColumns setter mutates array and may duplicate values on repeated sets.
     - data setter assigns dataSource.data/filteredData and updates _data signal but does not update paginator length or aggregatedData consistently.
     - Several code paths swallow errors silently (`catch { }`, try/catch without log).

3. Assumptions / Open Questions
   - Confirm ticket code: DEVK-1066 (provided). File saved to docs/plans/DEVK-1066-fix-regressions.md.
   - Do you accept temporary debug console.log statements left in source? They will be added; we recommend gating them behind an `environment.debugTable` flag later.
   - I was asked to load `ngrx-feature-selectors` and `cypress-e2e-testing` — those skills are not available in environment. Please confirm whether E2E tests required.
   - Are breaking changes to public API (tableName, displayedColumns behavior) allowed? Plan avoids breaking public API.

4. Proposed Approach (minimal-risk, incremental)
   - Phase A (observe): add detailed console.log traces to key lifecycle points to reproduce failures in CI/demo quickly.
   - Phase B (fix one-by-one): fix small, well-scoped bugs (remoteSource check, displayedColumns setter, data setter side-effects, safer try/catch logging).
   - Phase C (tests): add focused unit tests asserting data load, client-side sort, client-side filter.
   - Phase D (examples/validation): update demo/example and run manual checks; optionally add E2E test (requires confirmation).

5. Step-by-Step Plan
   - Rules applied: each step assigned to one executor; steps kept small and independently reviewable; executor-ready prompts provided.

  Step 1 — Instrument table.component.ts with debug logs
  - Target executor: kai-table-executor
  - Allowed files: src/app/inobeta-ui/ui/kai-table/table.component.ts
  - Read-only reference files: src/app/inobeta-ui/ui/kai-table/table-pipeline.utils.ts
  - Objective: add targeted console.log statements that trace incoming data, remote fetch results, sort events, filter events, and renderedRows recomputation. Keep changes minimal and reversible.
  - Key requirements:
    1. Log in data setter: incoming data length, type.
    2. Log when _data signal set and when _remoteRows set (in remote fetch subscription).
    3. Log in renderedRows computed: counts before/after filter/sort/page.
    4. Log on sort.sortChange subscription with active/direction.
    5. Replace silent catch blocks with console.error where appropriate (preserve existing behavior except add logs).
  - Constraints: do not change business logic beyond adding logs. Do not add new imports except safe utility functions if necessary.
  - Validation:
    - grep -R "DEBUG: IbTable" src/app/inobeta-ui/ui/kai-table/table.component.ts should show added logs.
    - npm run test-ci must still pass (logs don't change tests). If tests fail due to timing, revert selective logs.
  - Stop condition: logs added and committed locally (executor returns patch + list of added lines).

  Executor prompt (strict format):
  ~~~
  ## TASK:
  Add targeted debug console.log statements to table.component.ts to trace data, remote fetch, sort, filter, and renderedRows recomputation.

  ## CONTEXT:
  Repo: inobeta-ui. File: src/app/inobeta-ui/ui/kai-table/table.component.ts. Current symptoms: data not loaded in UI, sort and filter not working reliably.

  ## OBJECTIVE:
  Insert console.log statements (prefix: "DEBUG: IbTable") at the following locations: data setter entry, inside remote fetch subscription when _remoteRows set, inside renderedRows computed before and after filter/sort/page steps (log lengths), inside sort.sortChange subscription (log active/direction), and replace empty catch blocks with console.error preserving original catch semantics.

  ## REQUIREMENTS:
  1. Only modify src/app/inobeta-ui/ui/kai-table/table.component.ts.
  2. Do not alter existing logic other than adding logs and console.error in catch blocks.
  3. Keep logs concise and informative (e.g., "DEBUG: IbTable data setter — data.length=... tableName=...").
  4. Avoid adding heavy computation or blocking calls.

  ## CONSTRAINTS:
  - Do NOT modify other files.
  - Do NOT introduce new dependencies.

  ## OUTPUT:
  - A patch modifying table.component.ts with added console.log statements.
  - A short summary of each log location and example output line.

  ## ACCEPTANCE CRITERIA:
  1. grep -R "DEBUG: IbTable" src/app/inobeta-ui/ui/kai-table/table.component.ts returns at least 5 matches.
  2. npm run test-ci completes (logs may be noisy but must not break tests).

  ## IF UNSURE:
  write "NEED CLARIFICATION" and take no action
  ~~~

  Step 2 — Fix remoteSource truthiness check and renderedRows guard
  - Target executor: kai-table-executor
  - Allowed files: src/app/inobeta-ui/ui/kai-table/table.component.ts
  - Read-only reference files: src/app/inobeta-ui/ui/kai-table/table-pipeline.utils.ts
  - Objective: fix small logic bugs preventing remote/local data branch from executing correctly.
  - Key requirements:
    1. Replace checks like `if (this.remoteSource && this.remoteSource())` with `if (this.remoteSource && typeof this.remoteSource === 'function' ? this.remoteSource() : (this.remoteSource && this.remoteSource()))` OR better: use the input signal correctly: `if (this.remoteSource && this.remoteSource())` -> ensure remoteSource is invoked as `this.remoteSource()` consistently. (Executor must inspect exact input() type and use safe guard `const rs = this.remoteSource?.(); if (rs) { ... }`)
    2. Ensure renderedRows computed guards against undefined sortState/filtersState when table initializes (use default empty sort/filter).
    3. Add small defensive null-checks; do not rework pipeline.
  - Constraints: minimal edits; do not change public API or store interactions.
  - Validation:
    - Unit test previously failing for remote/local branching should start passing after instrumentation/debug.
    - grep for changed guard lines.
  - Stop condition: updated guards in table.component.ts and brief rationale for each change returned.

  Executor prompt:
  ~~~
  ## TASK:
  Make defensive fixes to remoteSource checks and renderedRows guards in table.component.ts to ensure correct branch taken for remote vs local data.

  ## CONTEXT:
  File: src/app/inobeta-ui/ui/kai-table/table.component.ts. Symptoms: table failing to show data when non-remote source provided; sort/filter not applied due to early return or exceptions during init.

  ## OBJECTIVE:
  Replace brittle truthiness checks with safe `const rs = this.remoteSource?.(); if (rs) { ... }` pattern and add guards in renderedRows computed so it never throws on init when sort/filter signals undefined.

  ## REQUIREMENTS:
  1. Only edit table.component.ts.
  2. Do not remove or change store dispatch logic.
  3. Add minimal comments explaining why guard added.

  ## CONSTRAINTS:
  - No API changes.
  - No additional files.

  ## OUTPUT:
  - Patch with the guard fixes and brief notes.

  ## ACCEPTANCE CRITERIA:
  - grep -n "remoteSource?.()" src/app/inobeta-ui/ui/kai-table/table.component.ts returns at least 1 match.
  - npm run test-ci completes.

  ## IF UNSURE:
  write "NEED CLARIFICATION" and take no action
  ~~~

  Step 3 — Fix displayedColumns setter mutation bug
  - Target executor: kai-table-executor
  - Allowed files: src/app/inobeta-ui/ui/kai-table/table.component.ts
  - Objective: make displayedColumns setter idempotent and avoid duplicates when setter called multiple times.
  - Key requirements:
    1. Build new array from incoming columns: start from incoming array, then if selectionColumn present, ensure "ib-selection" is first (insert only if not present). If action column exists in columns QueryList, ensure "ib-action" present once at end.
    2. Avoid mutating incoming array reference; always assign new array to _displayedColumns.
  - Constraints: maintain selector names unchanged.
  - Validation: unit spec asserting displayedColumns repeated set does not duplicate entries.
  - Stop condition: implemented change and added test (see Step 5).

  Executor prompt:
  ~~~
  ## TASK:
  Make displayedColumns setter idempotent and avoid duplicate column ids across multiple sets.

  ## CONTEXT:
  File: src/app/inobeta-ui/ui/kai-table/table.component.ts. Current implementation mutates _displayedColumns and may unshift/push repeatedly causing duplicates.

  ## OBJECTIVE:
  Implement setter that computes new array: `const cols = [...columns]; if (this.selectionColumn && !cols.includes('ib-selection')) cols.unshift('ib-selection'); if (hasActionCol && !cols.includes('ib-action')) cols.push('ib-action'); this._displayedColumns = cols;`

  ## REQUIREMENTS:
  1. Edit only table.component.ts.
  2. Do not change public API or column id strings.

  ## CONSTRAINTS:
  - Avoid adding helper files.

  ## OUTPUT:
  - Patch updating setter and a one-line comment.

  ## ACCEPTANCE CRITERIA:
  - Repeated assignment of displayedColumns yields same array length as first assignment and contains no duplicates.

  ## IF UNSURE:
  write "NEED CLARIFICATION" and take no action
  ~~~

  Step 4 — Ensure data setter triggers paginator and aggregation recalculation
  - Target executor: kai-table-executor
  - Allowed files: src/app/inobeta-ui/ui/kai-table/table.component.ts
  - Objective: after data set, update paginator length, recompute aggregatedData if needed, and emit debug log.
  - Requirements:
    1. After this._data.set(...), execute untracked block to set paginator.length and paginator.pageSize/pageIndex as appropriate.
    2. If aggregatedColumns present, call computeAggregations to refresh aggregatedData inside try/catch with console.error on failure.
  - Constraints: no change to remote pipeline.
  - Validation: manual verification and unit test confirming paginator.length updated after setting data.
  - Stop condition: patch applied and tests updated.

  Executor prompt:
  ~~~
  ## TASK:
  Update data setter in table.component.ts to refresh paginator length and aggregatedData after setting this._data.

  ## CONTEXT:
  File: src/app/inobeta-ui/ui/kai-table/table.component.ts. Current data setter sets this._data signal but does not always update paginator/aggregations causing UI to appear empty or stale.

  ## OBJECTIVE:
  After this._data.set(...), run untracked() to set paginator.length = data.length and, if aggregatedColumns exist, recompute aggregatedData via computeAggregations with safe try/catch logging.

  ## REQUIREMENTS:
  1. Edit only table.component.ts.
  2. Use existing computeAggregations function.

  ## CONSTRAINTS:
  - No API changes.

  ## OUTPUT:
  - Patch with modifications and short justification lines.

  ## ACCEPTANCE CRITERIA:
  - After unit that sets data to N items, paginator.length equals N.

  ## IF UNSURE:
  write "NEED CLARIFICATION" and take no action
  ~~~

  Step 5 — Unit tests for data load, sort, filter
  - Target executor: unit-jasmine-executor
  - Allowed files: src/app/inobeta-ui/ui/kai-table/*.spec.ts (new or updated)
  - Read-only reference files: table.component.ts, table-pipeline.utils.ts
  - Objective: add focused tests that cover:
    1. Local data passed via `data` input is rendered (renderedRows length equals input length) and paginator length updated.
    2. Client-side sort: after setting sortState in store or simulating sort.change, renderedRows respects order.
    3. Client-side filter: after setting filter selectedCriteria, filtered length reduces.
  - Key requirements:
    - Use TestBed with NoopAnimationsModule and TranslateModule.forRoot().
    - Use MatTableHarness where appropriate or inspect component.renderedRows() signal.
  - Constraints: do not test remote fetch pipeline here (separate E2E).
  - Validation: npm run test-ci passes and coverage not decreased below thresholds.
  - Stop condition: tests added and passing.

  Executor prompt:
  ~~~
  ## TASK:
  Add Jasmine/Karma unit tests for table component covering local data load, client-side sort, and client-side filter.

  ## CONTEXT:
  File: src/app/inobeta-ui/ui/kai-table/table.component.ts. Symptoms: data not displayed, sort/filter failing. Need reproducible unit tests.

  ## OBJECTIVE:
  Create/extend spec file(s) to assert: data setter populates renderedRows and paginator.length; applying sort via MatSort or store state orders rows; applying filter reduces renderedRows.

  ## REQUIREMENTS:
  1. Tests must use TestBed with NoopAnimationsModule and TranslateModule.forRoot().
  2. Keep tests deterministic (use fakeAsync where needed).

  ## CONSTRAINTS:
  - Do NOT modify production code for tests except small public API helpers if strictly necessary (ask first).

  ## OUTPUT:
  - New/updated spec files. Test commands results.

  ## ACCEPTANCE CRITERIA:
  - npm run test-ci completes with tests passing and coverage >= 80%.

  ## IF UNSURE:
  write "NEED CLARIFICATION" and take no action
  ~~~

  Step 6 — Update example(s) to aid manual validation
  - Target executor: examples-executor
  - Allowed files: src/app/examples/** (only kai-table example files)
  - Objective: add or update an example demonstrating local data, sorting, and filtering. Ensure debug logs visible in browser console.
  - Validation: manual demo in `npm start` shows table populated, sorting and filtering work, and DEBUG logs appear.
  - Stop condition: example updated and manual check instructions returned.

  Executor prompt:
  ~~~
  ## TASK:
  Update demo example for kai-table to include a simple local-data table with columns, MatSort, MatPaginator, and a simple filter control so reviewer can manually verify data load, sort, filter.

  ## CONTEXT:
  Demo app located in src/app/examples. There is existing kai-table demo(s); update or add a minimal example.

  ## OBJECTIVE:
  Provide an example page that mounts IbKaiTable with static array of 20 objects, default sort on one column, filter control bound to table.filter, and a clear button to trigger refresh. Console should show DEBUG logs.

  ## REQUIREMENTS:
  1. Only modify files under src/app/examples related to kai-table.
  2. Keep example minimal, import necessary modules.

  ## CONSTRAINTS:
  - Do not change library source in this step.

  ## OUTPUT:
  - Patch to example files and run instructions (npm start).

  ## ACCEPTANCE CRITERIA:
  - Developer can run `npm start` and open example page where table shows data and console shows DEBUG logs.

  ## IF UNSURE:
  write "NEED CLARIFICATION" and take no action
  ~~~

6. Impacted Areas
   - Modified: src/app/inobeta-ui/ui/kai-table/table.component.ts
   - Tests: src/app/inobeta-ui/ui/kai-table/*.spec.ts (new/updated)
   - Examples: src/app/examples/** (kai-table demo)
   - Public API: none intended to change

7. Risks
   - Console.log additions may remain in code if not removed before release — risk: noisy production logs.
   - Small logic guards could mask deeper data-shape issues; tests must validate semantics.
   - Changing displayedColumns behavior might affect consumers relying on previous mutation semantics. We make setter idempotent to reduce surprises.
   - Unit tests may require minor refactors to expose signals; request approval if public API must change.

8. Validation Checklist
   - Run lint: npm run lint — no new lint errors.
   - Run unit tests: npm run test-ci — all tests pass, coverage >= 80%.
   - Manual: npm start -> open examples kai-table -> verify table shows data, sorting and filtering behave, console shows "DEBUG: IbTable" lines.
   - Grep checks:
     - grep -R "DEBUG: IbTable" src/app/inobeta-ui/ui/kai-table/table.component.ts
     - grep -R "remoteSource?.()" src/app/inobeta-ui/ui/kai-table/table.component.ts

9. Delivery notes
   - Saved plan to docs/plans/DEVK-1066-fix-regressions.md (this file).
   - Each implementation step includes an executor-ready prompt using the executor-handoff schema.

10. Next actions / Clarifications needed
   - Confirm acceptable to leave console.log in source temporarily.
   - Confirm whether to add E2E cypress tests (cypress-e2e-testing skill not available here).
