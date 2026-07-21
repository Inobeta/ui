# DEVK-1066 — Kai table refactoring — Post-implementation feedback

## References
- Original plan: `docs/plans/DEVK-1066-kai-table-refactoring.md`.
- Branch reviewed: `refactor/DEVK-1066-store-and-datasource` vs `origin/develop/20.0.0` (`origin/develop` does not exist locally).
- Review date: `2026-07-20`.

## Verdict
**FAIL**

1 final-review step covering the 27 implementation steps was reviewed. Found 11 BLOCKER, 10 WARNING, and 3 NIT findings. Build and package build pass, but the architecture is not yet internally consistent and Storybook plus the planned Kai Table aggregate test command fail.

## Reviewed steps

### Step 25 — Review finale integrata
- **Original plan state**: `[DONE]` (Steps 1–24 are declared complete by commit `f284301`).
- **Acceptance criteria**: 2 / 2 for the review output; only 1 / 8 technical review areas is fully satisfied end-to-end.
- **Verification commands**: 14 pass / 6 fail / 0 skipped.
- **Expected files**: all DEVK-1066 files listed by Steps 1–24 across `ui/kai-table`, `ui/kai-table-mobile`, `ui/data-export`, `ui/views`, examples, Storybook, migration documentation, and related specs.
- **Files actually changed** (diff vs develop): 83 files: DEVK-1066 docs/plans; 13 Kai Table examples; data-export service/spec; 5 mobile production files and 1 spec; Kai Table component, data sources, state/URL/store, columns/cells/actions, Storybook/MDX and specs; views adapter/spec; plus the out-of-scope files listed below.
- **Issues found**:
  - `[BLOCKER]` The public `IbTableLocalDataSource` cannot be supplied to `IbTable`: the input and active source unions accept only the deprecated wrapper or the remote source, `[data]` constructs the wrapper, and local handling assumes legacy Material members (`table.component.ts:78,125,151-159,239-242,333-360`). Impact: the documented replacement source is unusable through the public component API. Recommendation: complete the cutover to a common data-source contract and use `IbTableLocalDataSource` internally.
  - `[BLOCKER]` `IbFilter` has no synchronous, silent raw-state hydration or explicit null clear: its setter ignores null, defers with `setTimeout`, and emits a user update (`kai-filter/filter.component.ts:67-76,91-112`). Impact: URL/view hydration cannot safely restore or clear canonical filter state without feedback. Recommendation: add a typed raw-state hydration boundary with silent clear/apply semantics.
  - `[BLOCKER]` The table stores the processed filter instead of `selectedCriteria`, sends raw snapshot values to the remote source instead of the derived server query, and does not await filter readiness before the first request (`table.component.ts:252,257-279,333-346`; `kai-filter/filter.component.ts:79-94`). Impact: NgRx/URL violate the raw-form contract and initial remote requests can be duplicated or malformed. Recommendation: bridge raw state to NgRx and derived query to the remote source after a filter initialization barrier.
  - `[BLOCKER]` Aggregation changes mutate the compatibility data source directly and never call the facade (`columns/column.ts:208-212`; `table-data-source.ts:58-61`). Impact: rendered aggregation, NgRx, URL, and views diverge. Recommendation: route aggregation intent through `setAggregatedColumns` and apply only canonical snapshots to sources.
  - `[BLOCKER]` View/null precedence and post-init URL hydration are incorrect: URL `view:null` leaves the initial-view snapshot applied, unresolved IDs remain selected, an absent table query param is ignored, and partial/back-forward payloads are resolved without tableDef or view snapshots (`table-state-resolver.ts:80-103`; `table-state.facade.ts:198-222,385-410`; contrary expectations are codified in `table-state-resolver.spec.ts:683-718` and `table-state.facade.spec.ts:629-638`). Impact: default-view links and browser navigation restore the wrong state. Recommendation: reuse one asynchronous precedence pipeline for init and external URL changes, normalizing unresolved views to null.
  - `[BLOCKER]` Data-source and async-initialization teardown is incomplete: replacement does not detach old control bindings, compatibility `connect()` overwrites one subscription, remote `disconnect()` is empty with a permanent pipeline subscription, and initialization can resume after destroy (`table.component.ts:205-279`; `table-data-source.ts:88-111,161-169`; `remote-data-source.ts:42-45,74-99,125`; `table-state.facade.ts:198-235,316-375`). Impact: stale sources may keep reacting or fetching and destroyed tables can leak subscriptions. Recommendation: add ref-safe connection ownership, replacement cleanup, remote cancellation, and destroy guards around awaits.
  - `[BLOCKER]` Unsupported remote selection/export remains visible on desktop: no selection capability exists, a projected selection column is always added, selected export is exposed, and remote export silently returns (`data-source.types.ts:52-57`; `table.component.ts:160-170,300-304`; `table.component.html:5-11,31-33`; `columns/selection-column.ts:68-96`). Impact: users can accumulate cross-page selections and invoke operations the remote contract explicitly does not support. Recommendation: declare and enforce selection/current-page export capabilities in the renderer.
  - `[BLOCKER]` Mobile always offers full export and receives no data-source capabilities (`kai-table-mobile/table-mobile-toolbar.component.ts:300-307`; `table.component.html:87-103`). Impact: a remote table presents full export as supported although the operation is discarded. Recommendation: pass capability state into mobile and gate the action/options.
  - `[BLOCKER]` The public signal migration is incomplete and the guides prescribe runtime-invalid calls: actual signals are private-style `__tableName`/`__displayedColumns`, while public `tableName`/`displayedColumns` remain value getters; the guides call them as functions (`table.component.ts:122-141`; `docs/DEVK-1066-kai-table-migration.md:7-24`; `deprecation-guide.md:7-33`). Impact: consumer code following the migration guide throws and the promised no-facade signal API is not delivered. Recommendation: expose the planned public signals and remove temporary getters, then align docs.
  - `[BLOCKER]` Storybook does not compile because `IbTimestampColumn` overrides a `ModelSignal` with a function and its template uses pre-signal properties (`table.stories.ts:76-130`). `npm run build-storybook` fails with TS2416. Recommendation: migrate the custom story column to the final signal API and update the matching MDX snippet.
  - `[BLOCKER]` Required integration coverage is disabled and the plan's Kai Table suite command fails: `table.component.spec.ts:272,310,396,595,603,679,686,739` contains 8 disabled tests, including required tableName/conflict/store/URL/paginator contracts; `ng test --include='.../kai-table/**/*.spec.ts'` ends with an NgRx `afterAll` error. Impact: key acceptance criteria are unverified despite green full-suite execution. Recommendation: stabilize TestBed/effects wiring and enable executable assertions.
  - `[WARNING]` Legacy URL actions still perform partial, race-prone writes rather than selecting the post-reducer full snapshot (`store/url-state/effects.ts:17-76`). Impact: compatibility consumers can lose fields. Recommendation: route legacy actions through the canonical full-state writer.
  - `[WARNING]` URL validation accepts or coerces invalid values as explicit clears, including page size zero and unrestricted sort directions (`table-url-codec.ts:79-84,114-134,202-218`). Impact: malformed links can erase higher-precedence state. Recommendation: reject invalid fields/schema and normalize without applying them.
  - `[WARNING]` Paginator page size remains bound to mutable `tableDef.paginator.pageSize` instead of canonical state (`table.component.html:78-84`). Impact: a runtime visual-config change can overwrite state outside NgRx. Recommendation: bind canonical page size and reserve paginator config for visual options.
  - `[WARNING]` The views component still reads URL state directly and does not apply canonical selected-view changes (`views/components/table-view-group/table-view-group.component.ts:71-86,182-185`). Impact: the active tab can disagree with NgRx after v2 hydration or back/forward. Recommendation: make the canonical snapshot the only boundary authority.
  - `[WARNING]` `IbDataExportService` still consumes the compatibility source and does not enforce capabilities; a spec expects a remote-like full export to succeed (`data-export.service.ts:51-101`; `data-export.service.spec.ts:521-546`). Impact: callers outside `IbTable` can misrepresent a remote page as a complete dataset. Recommendation: consume the common export contract and reject unsupported datasets.
  - `[WARNING]` Four local examples still instantiate deprecated `IbTableDataSource` (`kai-table-datasource-example.ts:28`, `kai-table-column-options-example.ts:38`, `kai-table-custom-aggregate-example.ts:33`, `kai-table-custom-sort-filter-example.ts:28`). Impact: examples do not validate or teach the new public local source. Recommendation: migrate after the component accepts the common contract.
  - `[WARNING]` Documentation omits the `tableDef.initialView` snapshot layer, contains table snippets without required `tableName`, and has contradictory legacy/full-state URL guidance (`migration.md:35-47`; `deprecation-guide.md:92-106`; `table.mdx:18,48-62,1089-1129`). Impact: consumers cannot predict precedence or copy valid examples. Recommendation: align all docs with the implemented five-layer resolver and canonical selectors.
  - `[WARNING]` Mobile signal/i18n/template safety is incomplete: labels interpolate signal functions, the export tooltip renders an untranslated key, and guarded values are repeatedly asserted non-null (`table-mobile-item.component.ts:19,23-27,41-45,53-75`; `table-mobile-toolbar.component.ts:58`). Impact: wrong labels/tooltip text and fragile templates. Recommendation: invoke signals, translate the tooltip, and alias guarded values.
  - `[WARNING]` Touched mobile files deep-import Kai Table internals instead of the feature barrel (`table-mobile-item.component.ts:4-5`; `table-mobile-toolbar.component.ts:20-23`). Impact: cross-feature coupling violates library import conventions. Recommendation: expose/consume supported symbols through the barrel.
  - `[WARNING]` The branch comparison includes unrelated DEVK-912/tooling and SCSS changes outside every DEVK-1066 executor boundary. See “Files outside the plan scope”. Recommendation: retarget/rebase or explicitly document the prerequisite before release.
  - `[NIT]` Presence checks use `in` instead of own-property semantics and the generic setter introduces `any` (`table-state-resolver.ts:117-124,140-150`). Recommendation: use `hasOwnProperty` and a typed key/value helper.
  - `[NIT]` Wildcard store exports expose internal selector factory `ibKaiTableExtraSelectors` (`kai-table/index.ts:28`; `store/url-state/selectors.ts:54`). Recommendation: export only supported public selectors.
  - `[NIT]` Two views CRUD specs have no expectations (`table-view-group.component.spec.ts:488-511`). Recommendation: assert service calls and resulting active-view state.
- **Notes**: The required decorator scan passes for production under `ui/kai-table`; matches are limited to specs and a JSDoc example. Data-source files do not import Store, Router, URL service, views, or selection. `npm run build`, `npm run packagr`, and the full `npm run test-ci` command pass.

## Files outside the plan scope

- `[WARNING]` `.opencode/package.json` and `.opencode/package-lock.json` — tooling dependency changes are unrelated to DEVK-1066.
- `[WARNING]` `docs/plans/DEVK-912-decouple-table-views.md` and `docs/plans/DEVK-912-decouple-table-views-feedback.md` — separate ticket artifacts are stacked on the reviewed base.
- `[WARNING]` `src/app/inobeta-ui/ui/kai-table/table.component.scss` — no DEVK-1066 implementation step allowed SCSS changes; this comes from the stacked DEVK-912 commit.
- `[WARNING]` `docs/plans/DEVK-1066-step-12-1-remote-cutover.md` — intermediate plan artifact is not listed by the original plan.

## Scope Check

The DEVK-1066 commit itself mostly follows the per-executor folders, but the branch is stacked on DEVK-912 and includes tooling/SCSS files outside the DEVK-1066 plan. No `public_api.ts` change was made; the existing root barrel already re-exports Kai Table.

## Convention Violations

- Mobile templates do not consistently invoke signals or alias nullable query results.
- The mobile export tooltip omits `TranslatePipe` and displays a raw key.
- Touched mobile code deep-imports Kai Table implementation files.
- New/touched code retains `any` in the resolver helper, Storybook custom column, and table compatibility accessors.

## Missing Validation

- Manual validation checklist items from the plan were not executable in this review; the identified URL/view/filter/capability defects block several of them.
- No public-consumer compile test binds `IbTableLocalDataSource` to `[dataSource]`.
- No test proves silent raw-filter hydration, `filters:null` UI clearing, or the exact derived first remote query.
- No test covers destroy during delayed view resolution or cancellation of an in-flight replaced remote source.
- No UI test proves remote selection/export options are hidden on desktop and mobile.
- `npm run lint` cannot run because the Angular project has no lint target.
- `npm run test-ci` reports 574 successes and 8 skipped tests, but the required focused Kai Table glob command fails and core integration cases remain disabled.

## Suggested Fixes

Start with Remediations 1–5 because they restore the core local/filter/state/URL architecture. Then address lifecycle/capability issues (6–8), finish the public signal contract (9), and only afterward update Storybook, tests, export, examples, and docs (10–14).

## Remediation plan

### Remediation 1 — Complete local data-source cutover [agent: kai-table-executor] [model: github-copilot/gpt-5.6-sol]

**Observed problem**: The public local source is exported/documented but cannot be bound to `IbTable`, and `[data]` still creates the deprecated wrapper.

**Original step**: 11/12.1 — Common/local data source and component cutover.

**Prompt for the agent**:
~~~
## TASK:
Complete IbTable integration with the common local/remote data-source contract.

## CONTEXT:
IbTable currently accepts only IbTableDataSource or IbTableRemoteDataSource and assumes legacy Material members.

## OBJECTIVE:
Allow IbTableLocalDataSource through [dataSource] and use it for [data] without legacy internals.

## REQUIREMENTS:
1. Limit production edits to ui/kai-table data-source contracts and table component/template.
2. Type desktop/mobile bridges against the common renderer contract.
3. Apply canonical snapshots through public value-object APIs.
4. Preserve the deprecated wrapper only for compatibility.
5. Add focused integration coverage for explicit local binding and [data].

## CONSTRAINTS:
Do not modify examples, docs, mobile implementation, public_api.ts, or add unrelated refactors.

## OUTPUT:
Changed files and focused build/test results.

## ACCEPTANCE CRITERIA:
- An explicit IbTableLocalDataSource compiles and renders through [dataSource].
- [data] creates the local implementation.
- `npm run packagr` passes.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 2 — Add silent raw-filter hydration [agent: task-executor] [model: github-copilot/gpt-5.6-sol]

**Observed problem**: IbFilter cannot silently apply/clear serialized raw criteria, so canonical hydration emits user events and ignores null.

**Original step**: 12.1 — Filter resolution before source connection.

**Prompt for the agent**:
~~~
## TASK:
Add a minimal typed API to hydrate and clear IbFilter raw form state silently.

## CONTEXT:
The current value setter accepts processed syntax, ignores null, uses setTimeout, and emits updates.

## OBJECTIVE:
Provide deterministic raw-state restoration for Kai Table without changing normal user events.

## REQUIREMENTS:
1. Modify only the kai-filter component and its focused specs.
2. Accept serializable raw form values and explicit null clear.
3. Support silent application without ibFilterUpdated/ibQueryUpdated emissions.
4. Keep existing interactive update/reset behavior compatible.
5. Cover non-null hydrate, null clear, and no-emission cases.

## CONSTRAINTS:
Do not modify Kai Table, NgRx, URL, templates, or translations.

## OUTPUT:
Changed files, API summary, and focused Jasmine result.

## ACCEPTANCE CRITERIA:
- Raw state can be applied and cleared synchronously without user-event emission.
- Existing filter tests pass.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 3 — Correct filter bridge and first fetch [agent: kai-table-executor] [model: github-copilot/gpt-5.6-sol]

**Observed problem**: IbTable persists processed filters, sends raw filters as remote queries, and fetches before filter initialization.

**Original step**: 12.1/14 — Component cutover and integration coverage.

**Prompt for the agent**:
~~~
## TASK:
Correct the canonical filter bridge and remote initialization barrier.

## CONTEXT:
After Remediation 2, IbFilter exposes silent raw hydration. NgRx must store selectedCriteria while remote requests consume the derived query.

## OBJECTIVE:
Produce exactly one first remote request with the fully resolved typed query and no URL feedback.

## REQUIREMENTS:
1. Modify only table.component.ts/html and focused table specs.
2. Persist raw selectedCriteria through the facade.
3. Hydrate/clear filters silently from canonical snapshots.
4. Pass the derived filter query to remote setInput.
5. Await filter and view readiness before source connection/fetch.
6. Test initial filter, filters:null, one first fetch, and no hydration write-back.

## CONSTRAINTS:
Do not modify store, codec, examples, docs, or add retry/caching.

## OUTPUT:
Changed files and focused Jasmine result.

## ACCEPTANCE CRITERIA:
- NgRx/URL contain raw criteria.
- The first remote request occurs once with the derived query.
- filters:null clears the UI without persisting a user action.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 4 — Route aggregation through NgRx [agent: kai-table-executor] [model: github-copilot/gpt-5.6-sol]

**Observed problem**: Column aggregation mutates the compatibility data source directly, bypassing canonical state.

**Original step**: 12.1/15 — Canonical component bridge and child signal APIs.

**Prompt for the agent**:
~~~
## TASK:
Make aggregation changes canonical facade intents.

## CONTEXT:
IbColumn.handleAggregationChange currently calls dataSource.aggregate directly.

## OBJECTIVE:
Keep NgRx, URL, views, and source aggregation synchronized.

## REQUIREMENTS:
1. Modify only ui/kai-table column/table integration and focused specs.
2. Send aggregation changes through IbKaiTableStateFacade.
3. Apply aggregation to sources only from canonical snapshots.
4. Preserve local aggregation rendering and remote capability gating.

## CONSTRAINTS:
Do not modify views, data-export, mobile, or add global remote aggregation.

## OUTPUT:
Changed files and focused test results.

## ACCEPTANCE CRITERIA:
- Aggregation updates the canonical snapshot and URL writer path.
- Local footer behavior remains covered.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 5 — Reuse precedence for URL hydration [agent: kai-table-executor] [model: github-copilot/gpt-5.6-sol]

**Observed problem**: Initial and post-init URL resolution diverge; null/default/unresolved-view behavior violates the plan.

**Original step**: 1/9/10 — Resolver and per-table facade.

**Prompt for the agent**:
~~~
## TASK:
Unify initialization and back/forward resolution semantics.

## CONTEXT:
The facade ignores query-param removal and resolves later payloads without tableDef/view snapshots; unresolved view IDs remain selected.

## OBJECTIVE:
Use one asynchronous five-layer resolver path for init and external URL changes.

## REQUIREMENTS:
1. Modify resolver, facade, and their focused specs only.
2. Make URL view:null suppress the initial-view snapshot so other initial* fields re-emerge.
3. Normalize unresolved views to selectedView:null.
4. Hydrate the resolved baseline when the table query param is removed.
5. Resolve URL view snapshots on post-init navigation.
6. Preserve own-navigation loop suppression and no URL write from hydration.
7. Use own-property presence checks.

## CONSTRAINTS:
Do not modify components, effects, views implementation, or URL schema names.

## OUTPUT:
Changed files and focused Jasmine result.

## ACCEPTANCE CRITERIA:
- Tests cover view:null, unknown view, partial URL, and param removal.
- Browser back/forward dispatches one correct hydrate action without a write loop.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 6 — Fix source and async teardown [agent: kai-table-executor] [model: github-copilot/gpt-5.6-sol]

**Observed problem**: Replaced/destroyed local and remote sources retain bindings or active pipelines; async init can subscribe after destroy.

**Original step**: 12.1/13 — Replacement and effect cleanup.

**Prompt for the agent**:
~~~
## TASK:
Make data-source replacement and asynchronous initialization teardown deterministic.

## CONTEXT:
Compatibility connect overwrites one bridge, remote disconnect is empty, and ngAfterContentInit can resume after destroy.

## OBJECTIVE:
Prevent stale emissions, requests, and subscriptions after replacement/destroy while supporting desktop/mobile consumers.

## REQUIREMENTS:
1. Modify only ui/kai-table component and data-source files plus focused specs.
2. Detach old control/source bindings on replacement.
3. Make concurrent connect/disconnect consumer-safe.
4. Cancel remote pipeline/in-flight work when no longer owned.
5. Abort initialization after destroy, including after awaited view resolution.
6. Test local↔remote replacement, two consumers, in-flight cancellation, and destroy-during-init.

## CONSTRAINTS:
Do not change state-retention policy or implement caching/retry.

## OUTPUT:
Changed files and focused test results.

## ACCEPTANCE CRITERIA:
- Replaced sources no longer emit/fetch for the table.
- Desktop and mobile can connect concurrently without disconnecting each other.
- No subscription is created after component destruction.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 7 — Gate desktop remote capabilities [agent: kai-table-executor] [model: github-copilot/gpt-5.6-sol]

**Observed problem**: Desktop exposes remote selection and export actions that the contract does not support.

**Original step**: 12.1/17 — Capability-driven renderer and export bridge.

**Prompt for the agent**:
~~~
## TASK:
Enforce remote selection and export capabilities in the desktop table.

## CONTEXT:
Selection columns and selected/current export controls are rendered without an explicit capability and remote export silently returns.

## OBJECTIVE:
Do not present unsupported remote operations as functional.

## REQUIREMENTS:
1. Modify only ui/kai-table capability types, table component/template, and focused specs.
2. Add explicit capabilities needed for selection and supported export datasets.
3. Gate projected selection and export options/actions by capability.
4. Keep local behavior unchanged.
5. Add remote UI assertions.

## CONSTRAINTS:
Do not implement multi-page selection or full remote export.

## OUTPUT:
Changed files and focused test results.

## ACCEPTANCE CRITERIA:
- Remote tables do not expose unsupported selection/full/selected export.
- Local selection/export remains available.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 8 — Gate mobile export and fix template [agent: kai-table-mobile-executor] [model: github-copilot/gpt-5.6-sol]

**Observed problem**: Mobile always offers full export and has signal/i18n/template-safety regressions.

**Original step**: 19/20 — Mobile contract and tests.

**Prompt for the agent**:
~~~
## TASK:
Consume source capabilities in mobile and correct touched signal/i18n bindings.

## CONTEXT:
The toolbar hardcodes showAllRowsOption=true; labels do not invoke signals and the tooltip is untranslated.

## OBJECTIVE:
Keep mobile capability behavior consistent with desktop and render correct labels.

## REQUIREMENTS:
1. Modify only ui/kai-table-mobile production/spec files.
2. Accept readonly capability/export-option inputs from the desktop bridge.
3. Hide unsupported remote export choices/actions.
4. Invoke column signals, translate the export tooltip, and alias nullable template values.
5. Import Kai Table symbols from its barrel.
6. Add focused remote/local capability and label tests.

## CONSTRAINTS:
Do not modify desktop files, implement infinite scroll, or change layout/CSS.

## OUTPUT:
Changed files and focused Jasmine result.

## ACCEPTANCE CRITERIA:
- Mobile remote mode does not offer full export.
- Column labels and tooltip render translated text.
- Mobile specs pass.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 9 — Finish public signal API [agent: kai-table-executor] [model: github-copilot/gpt-5.6-sol]

**Observed problem**: Public names are value getters while actual input/query signals use internal `__` names, contrary to the accepted breaking API.

**Original step**: 13/15 — Table and child signal migration.

**Prompt for the agent**:
~~~
## TASK:
Expose the planned IbTable public signal inputs and queries under their canonical names.

## CONTEXT:
Current code keeps temporary getters and internal __ signals, making documented table.tableName() invalid.

## OBJECTIVE:
Deliver the no-facade signal API while preserving Angular template binding aliases.

## REQUIREMENTS:
1. Modify only ui/kai-table component/child production files and focused specs.
2. Expose tableName, displayedColumns, dataSource, state, and Material queries as signals with planned names.
3. Remove temporary compatibility getters marked for Step 15 removal.
4. Update internal consumers and templates to invoke signals safely.
5. Preserve public template binding names.

## CONSTRAINTS:
Do not modify docs, examples, Storybook, CSS, or add a new compatibility facade.

## OUTPUT:
Changed files, breaking-name inventory, build and focused test results.

## ACCEPTANCE CRITERIA:
- Programmatic `table.tableName()` and documented signal reads compile.
- No temporary __ public signal indirection/getter facade remains.
- `npm run packagr` passes.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 10 — Repair Storybook signal story [agent: storybook-executor] [model: github-copilot/gpt-5.6-sol]

**Observed problem**: The custom timestamp column still uses decorator-era properties and fails TS2416.

**Original step**: 23 — Storybook and usage documentation.

**Prompt for the agent**:
~~~
## TASK:
Migrate the Kai Table timestamp story column and matching MDX snippet to the final signal API.

## CONTEXT:
IbTimestampColumn overrides ModelSignal dataAccessor with a function and its template reads signals as values.

## OBJECTIVE:
Restore a compiling Storybook build that demonstrates a valid custom column.

## REQUIREMENTS:
1. Modify only table.stories.ts and table.mdx.
2. Configure inherited model/input signals through their supported APIs.
3. Invoke all signals in the custom-column template.
4. Keep every story tableName unique and present.
5. Update the matching MDX code only.

## CONSTRAINTS:
Do not modify component implementation, examples, or add new stories.

## OUTPUT:
Changed files and Storybook build result.

## ACCEPTANCE CRITERIA:
- `npm run build-storybook` passes.
- No TS2416 error remains.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 11 — Enable integration acceptance tests [agent: unit-jasmine-executor] [model: github-copilot/gpt-5.6-sol]

**Observed problem**: Eight table tests are disabled and the planned Kai Table glob command fails in NgRx effects teardown.

**Original step**: 14/16 — Table integration and child signal coverage.

**Prompt for the agent**:
~~~
## TASK:
Replace disabled DEVK-1066 table tests with executable integration coverage and stabilize the focused suite.

## CONTEXT:
Required tableName, data/dataSource conflict, store/URL, paginator, view, and export tests are xit/xdescribe; the Kai Table glob command fails afterAll.

## OBJECTIVE:
Make the plan's focused command pass with no newly disabled tests.

## REQUIREMENTS:
1. Modify only ui/kai-table spec/stub files.
2. Remove xdescribe/xit introduced by DEVK-1066.
3. Add real assertions for required input, conflict, page reset, URL write, paginator restore, first fetch, and replacement cleanup.
4. Correct TestBed/effects teardown without changing production code.
5. Keep NoopAnimationsModule and Material harness usage where applicable.

## CONSTRAINTS:
Do not weaken assertions, use fdescribe/fit, or modify production files.

## OUTPUT:
Changed specs and exact test command results.

## ACCEPTANCE CRITERIA:
- `ng test --include='src/app/inobeta-ui/ui/kai-table/**/*.spec.ts' --watch=false` passes.
- No xdescribe/xit/fdescribe/fit remains in the changed Kai Table specs.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 12 — Enforce export capability contract [agent: task-executor] [model: github-copilot/gpt-5.6-sol]

**Observed problem**: Data export does not reject unsupported remote datasets and remains coupled to the compatibility source.

**Original step**: 17/18 — Export decoupling and tests.

**Prompt for the agent**:
~~~
## TASK:
Make IbDataExportService consume public export capabilities and reject unsupported datasets.

## CONTEXT:
The service accepts the legacy source and a spec expects remote-like full export to succeed.

## OBJECTIVE:
Preserve local all/current/selected export while making remote limitations explicit.

## REQUIREMENTS:
1. Modify only ui/data-export service/spec files.
2. Consume the public data-source export contract/capabilities.
3. Receive selected rows from the caller boundary.
4. Reject unsupported datasets explicitly.
5. Replace the contrary remote-like test.

## CONSTRAINTS:
Do not modify Kai Table, dialogs, formats, or implement full remote export.

## OUTPUT:
Changed files and focused Jasmine result.

## ACCEPTANCE CRITERIA:
- Local all/current/selected tests pass.
- Unsupported remote export is explicitly rejected.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 13 — Migrate local examples [agent: examples-executor] [model: github-copilot/gpt-5.6-sol]

**Observed problem**: Four examples still teach the deprecated compatibility source.

**Original step**: 22 — Application examples.

**Prompt for the agent**:
~~~
## TASK:
Migrate explicit local Kai Table examples to IbTableLocalDataSource after Remediation 1.

## CONTEXT:
Four examples instantiate IbTableDataSource and therefore do not validate the promoted public contract.

## OBJECTIVE:
Use only the supported public local source in new-code examples.

## REQUIREMENTS:
1. Modify only src/app/examples/kai-table-example files.
2. Replace explicit local compatibility sources with IbTableLocalDataSource.
3. Preserve custom sort/filter/aggregate behavior using typed extension points.
4. Keep public_api imports, tableName values, datasets, and layout unchanged.

## CONSTRAINTS:
Do not modify library code, routes, menu, translations, or remote behavior.

## OUTPUT:
Changed examples and build result.

## ACCEPTANCE CRITERIA:
- No local example instantiates IbTableDataSource.
- `npm run build` passes.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 14 — Align migration documentation [agent: task-executor] [model: github-copilot/gpt-5.6-sol]

**Observed problem**: Guides contain invalid signal calls, omit a precedence layer, and include invalid/contradictory snippets.

**Original step**: 23/24 — Usage documentation and migration guide.

**Prompt for the agent**:
~~~
## TASK:
Align Kai Table MDX and migration guides with the remediated final public API.

## CONTEXT:
Current docs call value getters as signals, omit the initialView snapshot layer, and have table snippets without tableName.

## OBJECTIVE:
Provide one consistent, copyable description of signals, precedence, URL hydration, and capabilities.

## REQUIREMENTS:
1. Modify only table.mdx, deprecation-guide.md, and docs/DEVK-1066-kai-table-migration.md.
2. Document exact final public signal names and access.
3. Show all five precedence layers and URL view:null behavior.
4. Add tableName to every table snippet.
5. Use canonical selectors/full-state URL behavior and label legacy selectors deprecated.
6. Keep remote limitations explicit.

## CONSTRAINTS:
Do not modify production code, examples, or promise out-of-scope mobile/remote features.

## OUTPUT:
Changed docs and validation searches/build result.

## ACCEPTANCE CRITERIA:
- All programmatic snippets compile conceptually against the final API.
- No ib-kai-table snippet omits tableName.
- Precedence includes the tableDef initialView snapshot layer.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

## Commands executed during this review

Chronological list of commands run, with result:

- `git branch --show-current && git status --short && git log --oneline -10` → PASS.
- `git rev-parse --verify origin/develop` → FAIL (`origin/develop` is absent; used `origin/develop/20.0.0`).
- `git diff --stat/name-status origin/develop/20.0.0...HEAD` → PASS.
- `git diff --check origin/develop/20.0.0...HEAD` → FAIL (Markdown hard-break trailing spaces in plan files, plus one DEVK-912 line).
- Production decorator search under `ui/kai-table` → PASS (only specs/JSDoc matched).
- Data-source forbidden-import search → PASS.
- `fdescribe` / `fit` search → PASS.
- `xdescribe` / `xit` search under Kai Table → FAIL (8 disabled tests).
- `npm run lint` → FAIL (project has no lint target).
- `npm run build` → PASS.
- `npm run packagr` → PASS.
- `npm run build-storybook` → FAIL (TS2416 in `table.stories.ts:130`).
- `npx ng test --include='src/app/inobeta-ui/ui/kai-table/**/*.spec.ts' --watch=false` → FAIL (NgRx effects `afterAll` error; reproduced).
- `npx ng test --include='src/app/inobeta-ui/ui/kai-table/table.component.spec.ts' --watch=false` → PASS (29 successes, 8 skipped).
- `npx ng test --include='src/app/inobeta-ui/ui/kai-table/{local-data-source,remote-data-source}.spec.ts' --watch=false` → PASS (15 successes).
- State/resolver/facade/URL/store focused specs → PASS (281 successes).
- `npx ng test --include='src/app/inobeta-ui/ui/kai-table-mobile/**/*.spec.ts' --watch=false` → PASS (6 successes).
- `npx ng test --include='src/app/inobeta-ui/ui/data-export/**/*.spec.ts' --watch=false` → PASS (18 successes).
- Views group focused spec → PASS (29 successes; 2 no-expectation warnings).
- `npm run test-ci` → PASS (574 successes, 8 skipped; unrelated template-test console errors remain).
