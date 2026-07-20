# DEVK-1066 — Kai table remote cutover — Post-implementation feedback

## References
- Original plan: `docs/plans/DEVK-1066-step-12-1-remote-cutover.md`.
- Branch reviewed: `refactor/DEVK-1066-store-and-datasource` vs `develop/20.0.0` (`origin/develop` is unavailable locally).
- Review date: `2026-07-20`.

## Verdict
**PASS with warnings**

1 relevant step reviewed. The three prior blockers are resolved: canonical snapshots are reapplied post-init, remote totals update the paginator with effect cleanup, and remote export returns safely. One remaining warning can issue duplicate remote requests from mobile sort.

## Reviewed steps

### Step 12.1 — Remote data source e cutover `IbTable`
- **Original plan state**: `[DONE]`.
- **Acceptance criteria**: 12 / 13 passed.
- **Verification commands**: 2 pass / 1 fail / 0 skipped.
- **Expected files**: `remote-data-source.ts`, `table.component.ts`, `table.component.html`, related specs.
- **Files actually changed** (latest uncommitted diff): `local-data-source.spec.ts`, `remote-data-source.ts`, `table.component.ts`, `table.component.html`, `table.component.spec.ts`.
- **Issues found**:
  - `[WARNING]` `updateSortFromMobile()` both calls `stateFacade.setSort()` and directly calls remote `source.setInput()` (`table.component.ts:311-316`). When the facade publishes the canonical snapshot, the snapshot effect calls `setInput()` again (`table.component.ts:212-224, 348-350`). A single mobile sort can therefore produce two server requests, contrary to the canonical facade → source flow.
- **Notes**: `action.templateRef()` is correct signal access and the nullable `TemplateRef` is accepted by `ngTemplateOutlet`; no template type assertion or unsafe nullable access was introduced.

## Files outside the plan scope

No files outside scope.

## Convention Violations

No additional `inobeta-ui-conventions` or `angular-template-safety` violations found in the reviewed changes.

## Missing Validation

- No focused test proves that one mobile sort produces exactly one remote request.
- `npx tsc -p tsconfig.app.json --noEmit` remains blocked outside this reviewed set by readonly `state` assignments in `src/app/examples/kai-table-example/server-side/kai-table-api-example.ts:74,77`.

## Remediation plan

### Remediation 1 — Avoid duplicate mobile-sort fetches [agent: kai-table-executor] [model: github-copilot/gpt-5.6-terra]

**Observed problem**: Mobile sorting bypasses the canonical snapshot application path and immediately calls remote `setInput`, then the facade snapshot applies the same request again.

**Original step**: 12.1 — Remote data source e cutover `IbTable`.

**Prompt for the agent**:
~~~
## TASK:
Ensure a mobile sort produces one remote request through the canonical facade snapshot path.

## CONTEXT:
`IbTable.updateSortFromMobile()` currently calls both `stateFacade.setSort()` and `IbTableRemoteDataSource.setInput()`. The snapshot effect subsequently applies the same sort to the active remote source.

## OBJECTIVE:
Preserve mobile sort behaviour without issuing a duplicate remote fetch.

## REQUIREMENTS:
1. Modify only `src/app/inobeta-ui/ui/kai-table/table.component.ts` and its focused spec if needed.
2. Route remote mobile sorting through `IbKaiTableStateFacade` only; let canonical snapshot propagation update the source.
3. Add or update a focused test asserting one mobile sort results in exactly one remote request after initialization.

## CONSTRAINTS:
Do not modify the facade, store, remote data source, mobile component, export service, public API, or unrelated specs. Do not restore legacy URL dispatches.

## OUTPUT:
List changed files and the focused Jasmine command result.

## ACCEPTANCE CRITERIA:
- A mobile sort changes canonical sort state and produces exactly one remote request.
- Desktop and local sort behaviour remains unchanged.
- `npx ng test --include='src/app/inobeta-ui/ui/kai-table/table.component.spec.ts' --watch=false` passes.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

## Commands executed during this review

- `git status --short && git branch --show-current && git diff --name-only && git diff --stat` → PASS.
- `git diff -- <reviewed files> && git diff --check` → PASS.
- `npx ng test --include='src/app/inobeta-ui/ui/kai-table/{local-data-source,remote-data-source,table.component}.spec.ts' --watch=false` → PASS (43 successes, 8 skipped).
- `npx ng test --include='src/app/inobeta-ui/ui/kai-table/table.component.spec.ts' --watch=false` → PASS (28 successes, 8 skipped).
- `npx tsc -p tsconfig.app.json --noEmit` → FAIL (unrelated example readonly assignments).
