# DEVK-1065 — Views Feature Refactor

> **Status:** Ready for implementation
> **Date:** 2026-06-10
> **Source analysis:** `docs/analysis/views-architecture-analysis.md`

---

## 1. Goal

Re-implement the views feature per the architecture analysis:

- Replace NgRx-based view store with a synchronous `IbViewService` (localStorage, no NgRx)
- Migrate all view components to `standalone: true`
- Decouple `IbTableViewGroup` from the datasource/NgRx; expose a clean `@Input`/`@Output` interface
- Orchestrate view selection inside `table.component.ts` using Angular signals/effects

---

## 2. Current State

### Repository state after the pre-commit diff

| File | State |
|---|---|
| `ui/views/components/table-view-group/table-view-group.component.ts` | Broken: imports deleted symbols (`IbViewService`, `selectTableViews`, `IView`, `ITableViewData`) |
| `ui/views/components/view-list/view-list.component.ts` | Broken: imports `IView` (deleted) |
| `ui/views/components/table-view/table-view.component.ts` | Broken: imports `IView` (deleted) |
| `ui/views/components/default-table-view/default-table-view.component.ts` | OK — no broken deps |
| `ui/views/components/view-dialog/view-dialog.component.ts` | OK — no broken deps |
| `ui/views/view.service.ts` | Deleted |
| `ui/views/view.module.ts` | Deleted |
| `ui/views/store/` (all NgRx infra) | Deleted |
| `ui/views/index.ts` | Deleted |
| `public_api.ts` — views entry | Removed |

### Kai-table state

- `table.component.ts`: `// Views support removed for desktop table` comments where wiring was removed
- `table-url.service.ts`: `getActiveView()`, `handleViewChange()`, `getViewState()`, `ibview` from `IbTableQsParams` are absent
- `IbKaiTableModule`: no view component imports
- Redux selectors: `ibTableSelectLastQueryStringRaw(tableName)` and `ibTableSelectUrlState(tableName)` already exist in `store/index.ts` — usable for the D1/A fallback without new state

---

## 3. Assumptions

1. `IbTableViewGroup` is a **`@ContentChild` of `IbTable`** declared by the consuming app inside `<ib-kai-table>`. `IbTable` uses `contentChild(IbTableViewGroup)` to read and wire it programmatically. Projected into the toolbar via `ng-content select`.
2. **Real-time dirty tracking** requires an `@Input() stateChanges$: Observable<unknown>` on `IbTableViewGroup`. `IbTable` builds and passes this as a merged stream of filter + paginator + sort changes after data-source init.
3. `IbViewSnapshot` has an optional `initial?: boolean` field set to `true` on the first emission to prevent the `applyViewToTable()` → URL write → re-init loop.
4. **D1/A — URL-empty fallback**: when no URL params exist for the table, `IbTable.ngOnInit()` reads from the existing `ibTableSelectLastQueryStringRaw(tableName)` Redux selector (already tracks filter/pagination/sort; no new fields needed). Active view stays "All" (default).
5. **D3/A — Atomic URL write**: `IbTableUrlService.setViewState()` (new method) writes all params including `ibview` in a single `router.navigate()` call. `applyViewToTable()` calls it directly (no NgRx dispatch for the view URL param).
6. `IbViewService` stores per-group arrays under key `${prefix}_${groupName}` in localStorage (default prefix `__ib-views__`, configurable via `InjectionToken`).
7. When `applyViewToTable()` receives `initial: true`, it applies state to the data source but skips the URL write.
8. `aggregatedColumns` changes may lack a dedicated Observable on the data source. Dirty tracking for this field is best-effort; executors must verify and escalate if needed.

---

## 4. Proposed Approach

Type-first, bottom-up:

1. Define `IbViewSnapshot` and the storage token — all other steps depend on them.
2. Migrate dumb components to standalone (minimal changes, type swap only).
3. Create `IbViewService` — no NgRx, no kai-table types.
4. Rewrite `IbTableViewGroup` — standalone, signals, new `@Input`/`@Output`.
5. Extend `IbTableUrlService` additively (three new methods, one new optional field).
6. Add orchestration to `IbTable` — signals/effects, `getCurrentTableState()`, `applyViewToTable()`, Redux fallback.
7. Wire module + public API.
8–10. Unit tests per layer.
11. Example app update.

No new NgRx slice, no new NgRx actions, no changes to existing method signatures.

---

## 5. Step-by-Step Plan

---

### Step 1 — Type scaffold: `IbViewSnapshot`, storage token, barrel stub

**Target executor:** `task-executor`
**Depends on:** —

**Allowed files:**
- `src/app/inobeta-ui/ui/views/view.types.ts` *(new)*
- `src/app/inobeta-ui/ui/views/view.tokens.ts` *(new)*
- `src/app/inobeta-ui/ui/views/index.ts` *(new — stub only)*

~~~
## TASK:
Create the IbViewSnapshot type file, injection token file, and a stub barrel for the views feature.

## CONTEXT:
Repo: inobeta-ui Angular library. Target folder: src/app/inobeta-ui/ui/views/.
All prior files in ui/views/store/ and ui/views/view.service.ts have been deleted.
There is no index.ts in ui/views/ at the moment.

## OBJECTIVE:
Produce three new files that all subsequent steps will import.

## REQUIREMENTS:
1. `view.types.ts`: export `interface IbViewSnapshot` with fields:
   - `id: string`
   - `name: string`
   - `groupName: string`
   - `componentType: string`
   - `data: unknown`
   - `initial?: boolean`  (internal flag; not to be stored in localStorage)
2. `view.types.ts`: export `const DEFAULT_VIEW_ID = '__ibTableView__all'`
3. `view.tokens.ts`: export `const IB_VIEWS_STORAGE_KEY = new InjectionToken<string>(...)`
   with `providedIn: 'root'` factory returning `'__ib-views__'`.
4. `index.ts` stub: re-export from `./view.types` and `./view.tokens` only.
   Components and service will be appended in later steps.

## CONSTRAINTS:
- No component or service code.
- `initial` must be optional and must NOT appear in localStorage-stored data.
- Use `Ib` prefix for class/interface names per project conventions.

## OUTPUT:
Three new TypeScript files.

## ACCEPTANCE CRITERIA:
- `npx tsc --noEmit` passes on the new files.
- `grep "IbViewSnapshot" src/app/inobeta-ui/ui/views/view.types.ts` has a match.
- `grep "DEFAULT_VIEW_ID" src/app/inobeta-ui/ui/views/view.types.ts` has a match.
- `grep "IB_VIEWS_STORAGE_KEY" src/app/inobeta-ui/ui/views/view.tokens.ts` has a match.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action.
~~~

---

### Step 2 — Dumb components: `standalone: true` + `IbViewSnapshot` type migration

**Target executor:** `task-executor`
**Depends on:** Step 1

**Allowed files:**
- `ui/views/components/default-table-view/default-table-view.component.ts`
- `ui/views/components/table-view/table-view.component.ts`
- `ui/views/components/view-list/view-list.component.ts`
- `ui/views/components/view-dialog/view-dialog.component.ts`
- `ui/views/components/index.ts`

**Read-only reference files:**
- `ui/views/view.types.ts` (Step 1 output)
- All four component `.html` files — read to understand current template; do **not** modify unless a compile error forces it

~~~
## TASK:
Migrate four view components to standalone: true and replace the deleted IView type
with IbViewSnapshot.

## CONTEXT:
Repo: inobeta-ui. All four components currently have `standalone: false` and some import
the deleted `IView` type. They must compile as standalone components.

## OBJECTIVE:
All four components compile as standalone; IView references removed; no template changes.

## REQUIREMENTS:
1. IbDefaultTableView:
   - `standalone: true`
   - `imports: [MatButtonModule, MatIconModule]`
2. IbTableView:
   - `standalone: true`
   - Replace `IView` with `IbViewSnapshot` in @Input and @Output types.
   - `imports: [MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule, TranslateModule]`
     (verify by reading the template — add only what is actually used)
3. IbViewList:
   - `standalone: true`
   - Replace `IView` with `IbViewSnapshot` in all @Input/@Output types.
   - `imports: [IbDefaultTableView, IbTableView, MatButtonModule, MatIconModule]`
4. IbTableViewDialog:
   - `standalone: true`
   - `imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule,
     MatInputModule, TranslateModule]`
5. Update `components/index.ts` to re-export all four.

## CONSTRAINTS:
- Zero template changes unless a `@if` / `@for` migration or a type error forces it.
- Do not add or remove @Input / @Output properties.
- Do not import anything from ui/views/store/ (deleted).
- Keep `standalone: false` comment replaced with `standalone: true`; no NgModule declaration.

## OUTPUT:
Updated .ts files; updated components/index.ts.

## ACCEPTANCE CRITERIA:
- `npx tsc --noEmit` passes on all four component files.
- `grep "standalone: false" ui/views/components/**/*.ts` returns no matches.
- `grep "IView" ui/views/components/**/*.ts` returns no matches.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action.
~~~

---

### Step 3 — Create `IbViewService`

**Target executor:** `task-executor`
**Depends on:** Steps 1, 2

**Allowed files:**
- `src/app/inobeta-ui/ui/views/view.service.ts` *(new)*
- `src/app/inobeta-ui/ui/views/index.ts` *(append export line)*

**Read-only reference files:**
- `storage/storage.service.ts` — use `IbStorageService` for all localStorage access
- `ui/views/components/view-dialog/view-dialog.component.ts` (Step 2 output)
- `ui/toast/` barrel — use `IbToastNotification` for user feedback
- Analysis §4.2 for dialog method signatures

~~~
## TASK:
Create IbViewService: synchronous localStorage CRUD + MatDialog orchestration. No NgRx.

## CONTEXT:
Repo: inobeta-ui. Replaces the deleted IbViewService that mixed NgRx dispatch + dialog.
The new service must be fully generic (no kai-table types).

## OBJECTIVE:
A working IbViewService with CRUD + dialog methods matching the analysis §4.2 contract.

## REQUIREMENTS:
1. `@Injectable({ providedIn: 'root' })`
2. Inject: `IbStorageService`, `MatDialog`, `IbToastNotification`, `IB_VIEWS_STORAGE_KEY`.
3. Storage key per group: `\`${storageKey}_${groupName}\``.
4. Internal helpers: `_readAll(groupName): IbViewSnapshot[]` and
   `_writeAll(groupName, views): void` via IbStorageService.
5. Public CRUD methods (all synchronous, all return updated snapshot(s)):
   - `getViews(groupName: string, componentType: string): IbViewSnapshot[]`
     → reads array; filters by componentType as corruption guard; returns [] if key missing.
   - `addView(p: Pick<IbViewSnapshot, 'name'|'groupName'|'componentType'|'data'>): IbViewSnapshot`
     → id = crypto.randomUUID(); appends; writes; returns new snapshot.
   - `saveView(snapshot: IbViewSnapshot, data: unknown): IbViewSnapshot`
     → updates data field only; writes; returns updated snapshot.
   - `renameView(snapshot: IbViewSnapshot, newName: string): IbViewSnapshot`
     → updates name only; writes; returns updated snapshot.
   - `duplicateView(p: Pick<IbViewSnapshot,'name'|'groupName'|'componentType'|'data'>): IbViewSnapshot`
     → delegates to addView.
   - `deleteView(snapshot: IbViewSnapshot): void`
     → removes by id; writes.
6. Dialog methods (return Observable, open IbTableViewDialog via MatDialog.open):
   - `openAddViewDialog(): Observable<{name: string}>`
   - `openDeleteViewDialog(view): Observable<void>`
   - `openRenameViewDialog(view): Observable<{name: string}>`
   - `openDuplicateViewDialog(view): Observable<{name: string}>`
   - `openSaveChangesDialog(view): Observable<{confirmed: boolean}>`
   - `openSaveAsDialog(): Observable<{confirmed: boolean; name?: string}>`
   Dialog results must pipe through `filter(r => r?.confirmed !== false)` where appropriate.
7. Toast notification on successful add, save, rename, delete operations.
8. Append `export * from './view.service'` to `ui/views/index.ts`.

## CONSTRAINTS:
- Zero imports from @ngrx, IbFilterSyntaxExtended, Sort, or any kai-table type.
- `initial` field of IbViewSnapshot must NOT be stored; strip it before writing.
- `getViews` must return [] (not throw) if the localStorage key is absent.
- `crypto.randomUUID()` usage: wrap in try/catch with
  `Math.random().toString(36).slice(2)` fallback for test-env compatibility.

## OUTPUT:
New view.service.ts; updated index.ts.

## ACCEPTANCE CRITERIA:
- `npx tsc --noEmit` passes.
- `grep -n "@ngrx\|IbFilterSyntax\|IbTableUrlService" src/app/inobeta-ui/ui/views/view.service.ts` returns empty.
- `grep "providedIn" src/app/inobeta-ui/ui/views/view.service.ts` has a match.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action.
~~~

---

### Step 4 — Rewrite `IbTableViewGroup`

**Target executor:** `task-executor`
**Depends on:** Steps 1, 2, 3

**Allowed files:**
- `ui/views/components/table-view-group/table-view-group.component.ts`
- `ui/views/components/table-view-group/table-view-group.component.html`

**Read-only reference files:**
- `ui/views/components/table-view-group/table-view-group.component.scss` — **do not modify**
- Analysis §4.3, §4.6 for interface and dirty-check spec

~~~
## TASK:
Rewrite IbTableViewGroup as a standalone signal-based component with a clean @Input/@Output
interface. Remove all NgRx, IbTableUrlService, and IbKaiTableAction dependencies.

## CONTEXT:
Repo: inobeta-ui. The component currently imports deleted symbols and must be fully rewritten.
Selector aliases `"ib-view-group, ib-table-view-group"` must be preserved.
The visual design (buttons, icons, tooltips) must remain identical.

## OBJECTIVE:
A compilable, signal-based standalone IbTableViewGroup that:
- Receives state from the consumer via inputs
- Notifies the consumer of view changes via outputs
- Performs deterministic dirty checking

## REQUIREMENTS:
1. `standalone: true`; `selector: "ib-view-group, ib-table-view-group"`.
2. `imports` array: [IbViewList, MatButtonModule, MatIconModule, MatTooltipModule, TranslateModule].
   Do NOT import IbKaiTableAction, IbTableActionModule, or Store.
3. New @Input properties:
   - `@Input() groupName: string`
   - `@Input() componentType: string`
   - `@Input() stateAccessor: () => unknown = () => ({})`
   - `@Input() initialViewId: string | null = null`
   - `@Input() stateChanges$: Observable<unknown> | null = null`
4. @Output properties (keep both for backward compat if needed):
   - `@Output() ibViewChanged = new EventEmitter<IbViewSnapshot>()`
   - Remove `@Output() ibResetView` (no longer used in the new arch)
5. Internal signals:
   - `views = signal<IbViewSnapshot[]>([])`
   - `activeView = signal<IbViewSnapshot>(this._buildDefaultView())`
   - `dirty = signal<boolean>(false)`
6. `_buildDefaultView()`: returns IbViewSnapshot with id=DEFAULT_VIEW_ID, name='',
   groupName=this.groupName, componentType=this.componentType, data={}.
7. `ngOnInit()`:
   a. Load `viewService.getViews(groupName, componentType)` → set `views` signal.
   b. If `initialViewId` is non-null: find view by id.
      - Found → set `activeView(found)`, emit `ibViewChanged({...found, initial:true})`.
      - Not found → set `activeView(defaultView)`, no emission.
   c. If `stateChanges$` is provided: subscribe with `takeUntil(_destroyed)`;
      on each emission call `dirty.set(this._checkDirty())`.
8. `_checkDirty()`: call `stateAccessor()`; compare with `activeView().data` using
   deterministic sorted-key JSON serialization:
   `JSON.stringify(obj, Object.keys(obj).sort())` — no FIXME comment.
   Return false if stateAccessor returns undefined.
9. CRUD handlers (handleAddView, handleRemoveView, handleRenameView, handleDuplicateView,
   handleSaveView, handleChangeView, handleDiscardChanges): same logic as current code,
   but replace BehaviorSubject.next() with signal.set(); reload views array from service
   after each mutation; emit `ibViewChanged` (with initial:false) after active view changes.
10. Template changes:
    - Remove `*ibTableAction` directive from both buttons (undo and save).
    - Keep buttons visually identical: same mat-icon-button, same mat-icon, same matTooltip,
      same [disabled] binding referencing `dirty()`.
    - Replace `[views]="views$ | async"` with `[views]="views()"`.
    - Replace `[activeView]="activeView"` with `[activeView]="activeView()"`.
    - Replace `[dirty]="dirty"` with `[dirty]="dirty()"`.

## CONSTRAINTS:
- SCSS file: do not touch.
- Do not import Store, IbTableUrlService, IbKaiTableAction, or SelectTableViews.
- `initial` field must be stripped before calling viewService CRUD methods.
- Keep the `ibResetView` output only if its template binding is present; otherwise remove.

## OUTPUT:
Updated .ts and .html files.

## ACCEPTANCE CRITERIA:
- `grep -n "@ngrx\|IbTableUrlService\|IbKaiTableAction\|ibTableAction" table-view-group.component.ts` → no matches.
- `grep "ibTableAction" table-view-group.component.html` → no matches.
- `npx tsc --noEmit` passes on the component.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action.
~~~

---

### Step 5 — Extend `IbTableUrlService`: `ibview` support

**Target executor:** `kai-table-executor`
**Depends on:** — (independent)

**Allowed files:**
- `src/app/inobeta-ui/ui/kai-table/table-url.service.ts`

**Read-only reference files:**
- `store/url-state/interfaces.ts` — `IbTableQsParams`
- `ui/views/view.types.ts` (Step 1) — for `DEFAULT_VIEW_ID` constant

~~~
## TASK:
Add ibview support to IbTableUrlService with three new methods and one new optional field.
Do not modify any existing method.

## CONTEXT:
Repo: inobeta-ui. IbTableUrlService manages URL query param serialization for the table.
The `getActiveView`, `handleViewChange`, `getViewState` methods that existed previously were
deleted in a pre-commit diff and must be reimplemented with the new architecture.

## OBJECTIVE:
IbTableUrlService exposes getActiveView(), setActiveView(), and setViewState() methods.
Existing methods and IbTableQsParams fields are unchanged except for one additive field.

## REQUIREMENTS:
1. Add `ibview?: string` to the `IbTableQsParams` type (optional, additive).
2. `getActiveView(tableName: string): string | null`
   - Returns `this.getRawParams(tableName).ibview ?? null`.
3. `setActiveView(tableName: string, viewId: string): void`
   - Calls `router.navigate([], { queryParams: { [tableName]: JSON.stringify({
     ...this.getRawParams(tableName), ibview: viewId }) }, queryParamsHandling: 'merge',
     replaceUrl: true })`.
   - If viewId === DEFAULT_VIEW_ID, omit the ibview field (or set to null) to keep URLs clean.
4. `setViewState(tableName: string, viewId: string, params: Partial<IbTableQsParams>): void`
   - Single atomic navigate: writes all provided params + ibview in one call.
   - viewId === DEFAULT_VIEW_ID → omit ibview from the serialized blob.
   - Uses `replaceUrl: true`, `queryParamsHandling: 'merge'`.

## CONSTRAINTS:
- Do not change any existing method (getFilters, setFilters, getPaginator, etc.).
- Do not change the existing IbTableQsParams fields — only add ibview? as optional.
- Import DEFAULT_VIEW_ID from ui/views/view.types; do not hardcode the string.

## OUTPUT:
Updated table-url.service.ts.

## ACCEPTANCE CRITERIA:
- `npx tsc --noEmit` passes.
- `grep "getActiveView\|setActiveView\|setViewState" table-url.service.ts` → 3 matches.
- `grep "ibview" table-url.service.ts` → at least 2 matches.
- Existing IbTableUrlService tests (if any) still pass.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action.
~~~

---

### Step 6 — Orchestrate views in `IbTable`

**Target executor:** `kai-table-executor`
**Depends on:** Steps 4, 5

**Allowed files:**
- `src/app/inobeta-ui/ui/kai-table/table.component.ts`
- `src/app/inobeta-ui/ui/kai-table/table.component.html`

**Read-only reference files:**
- `ui/views/components/table-view-group/table-view-group.component.ts` (Step 4 output) — for input/output interface
- `store/index.ts` — `ibTableSelectLastQueryStringRaw` selector
- `store/url-state/interfaces.ts` — `IbKaiTableParams` for D1/A Redux fallback
- `table-url.service.ts` (Step 5 output) — `getActiveView()`, `setViewState()`
- Analysis §4.4 (`getCurrentTableState`, `applyViewToTable` pseudocode)

~~~
## TASK:
Add view orchestration to IbTable using Angular signals and effects.
Wire IbTableViewGroup as a content child; implement getCurrentTableState() and
applyViewToTable(); handle URL init flow and Redux fallback.

## CONTEXT:
Repo: inobeta-ui. `table.component.ts` already uses contentChild() signals, inject(),
effect(), signal(), and toSignal(). The existing ngOnInit/ngAfterContentInit logic must
not be broken. New logic is purely additive.

## OBJECTIVE:
IbTable orchestrates the view group: passes initialViewId and stateChanges$, reacts
to ibViewChanged, applies view snapshots to its data source, writes ibview to URL.

## REQUIREMENTS:
### table.component.ts

1. Import IbTableViewGroup (from ui/views barrel, not direct path).
2. Add: `viewGroup = contentChild(IbTableViewGroup)` (signal-based content child).
3. Add: `viewIdFromUrl = signal<string | null>(null)`.
4. In `ngOnInit()`, BEFORE existing URL state logic:
   - `this.viewIdFromUrl.set(this.tableUrl.getActiveView(this.tableName))`.
5. In `ngOnInit()`, extend the `!hasUrlState` branch (currently does nothing for init):
   - Use `this.store.selectSignal(ibTableSelectLastQueryStringRaw(this.tableName))` to read
     cached Redux state. Read it once (not reactively). If the result has non-null filters
     or pagination, apply paginator (this.tableDef.paginator.pageSize = cached.ibpagesize)
     and store filter in a new `_cachedFilter` property for use when the filter initializes.
   - Active view remains defaultView ("All") — no Redux field for view id.
   - READ store/index.ts before writing this to confirm the exact selector name.
6. Build `tableStateChange$` property after data source is initialized (inside
   `filter.initialized.subscribe()` callback or equivalent):
   `tableStateChange$ = merge(this.filter.valueChanges$ (or equivalent), paginator.page,
   sort.sortChange)`. Expose as a property typed `Observable<unknown>`.
   NOTE: verify property names on IbFilter and MatPaginator before using them.
   If aggregatedColumns has no Observable, omit it and document the gap.
7. In `ngAfterContentInit()`, add an `effect()` that runs when `viewGroup()` is truthy:
   - Sets `viewGroup().initialViewId = this.viewIdFromUrl()`.
   - Sets `viewGroup().stateChanges$ = this.tableStateChange$`.
   - Subscribes to `viewGroup().ibViewChanged` via `takeUntil(this._destroyed)`,
     calling `this.applyViewToTable(view)` for each emission.
   - Use a guard: subscribe only once (use a `_viewGroupWired = false` flag).
8. `getCurrentTableState(): unknown`:
   Returns `{ filter: this.filter?.selectedCriteria ?? {}, pageSize: this.dataSource.paginator?.pageSize ?? 20, aggregatedColumns: this.dataSource.aggregatedColumns ?? {}, sort: { active: this.dataSource.sort?.active ?? '', direction: this.dataSource.sort?.direction ?? '' } }`.
9. `applyViewToTable(view: IbViewSnapshot)`:
   a. Cast `const data = view.data as ReturnType<typeof this.getCurrentTableState>`.
   b. Apply state to data source directly (bypass URL dispatch chain):
      - `if (data.filter && this.filter) this.filter.value = data.filter`
      - `if (this.dataSource.paginator) this.dataSource.paginator.pageSize = data.pageSize`
      - `if (data.aggregatedColumns) this.dataSource.aggregatedColumns = {...data.aggregatedColumns}`
      - Apply sort if sort instance exists.
   c. If `view.initial !== true`:
      Call `this.tableUrl.setViewState(this.tableName, view.id, this.getCurrentTableState()
      as IbTableQsParams)`.

### table.component.html

10. Read the full template before editing. Locate the toolbar/actions area (where
    `PortalOutlet` or `IbKaiTableAction` portal was rendered).
11. Add `<ng-content select="ib-view-group, ib-table-view-group"></ng-content>` in the
    toolbar area, matching the visual position of the old action portal.
    If the toolbar area is conditional (e.g., @if), include inside the same condition.

## CONSTRAINTS:
- Do not add new NgRx actions, reducers, or effects.
- Do not change existing ngOnInit/ngAfterContentInit logic paths for the `hasUrlState=true` case.
- Do not call tableUrl.setViewState() when `view.initial === true`.
- If `ibTableSelectLastQueryStringRaw` does not exist in store/index.ts with that exact name,
  write "NEED CLARIFICATION" and stop.

## OUTPUT:
Updated table.component.ts and table.component.html.

## ACCEPTANCE CRITERIA:
- `npx tsc --noEmit` passes on table.component.ts.
- `grep "viewGroup\|viewIdFromUrl\|applyViewToTable\|getCurrentTableState" table.component.ts` → ≥4 matches.
- `grep "ib-view-group" table.component.html` → ≥1 match.
- `npm run build` completes without errors.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action.
~~~

---

### Step 7 — Module + public API wiring

**Target executor:** `task-executor`
**Depends on:** Steps 1–4, 6

**Allowed files:**
- `src/app/inobeta-ui/ui/kai-table/table.module.ts`
- `src/app/inobeta-ui/ui/views/index.ts`
- `public_api.ts`

~~~
## TASK:
Register standalone view components in IbKaiTableModule and restore the views public API.

## CONTEXT:
Repo: inobeta-ui. All view components are now standalone. IbKaiTableModule needs to
import and export IbTableViewGroup so consumers can use it inside <ib-kai-table>.

## OBJECTIVE:
Library builds cleanly; all view public symbols are accessible via the public API.

## REQUIREMENTS:
1. `table.module.ts`:
   - Add `IbTableViewGroup` to `imports` array (standalone component).
   - Add `IbTableViewGroup` to `exports` array.
   - Do not add the other dumb components — they are IbTableViewGroup's own dependencies.
2. `ui/views/index.ts` (complete the barrel):
   Export all public symbols:
   `IbViewSnapshot`, `DEFAULT_VIEW_ID`, `IB_VIEWS_STORAGE_KEY`,
   `IbViewService`, `IbTableViewGroup`,
   `IbViewList`, `IbTableView`, `IbDefaultTableView`, `IbTableViewDialog`.
3. `public_api.ts`:
   Add line: `export * from './src/app/inobeta-ui/ui/views/index';`

## CONSTRAINTS:
- Do not export internal implementation details (storage helpers, etc.).
- Do not add `IbViewModule` (it no longer exists).
- Do not modify any other line in table.module.ts, views/index.ts, or public_api.ts.

## OUTPUT:
Updated table.module.ts, views/index.ts, public_api.ts.

## ACCEPTANCE CRITERIA:
- `npm run build` completes.
- `grep "IbTableViewGroup" src/app/inobeta-ui/ui/kai-table/table.module.ts` → ≥2 matches (import + export).
- `grep "IbViewSnapshot" public_api.ts` is indirectly covered (re-export chain).
- `npm run packagr && grep -r "IbViewSnapshot" dist/` → ≥1 match.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action.
~~~

---

### Step 8 — Unit tests: `IbViewService`

**Target executor:** `unit-jasmine-executor`
**Depends on:** Step 3

**Allowed files:**
- `src/app/inobeta-ui/ui/views/view.service.spec.ts` *(new)*

**Read-only:** `view.service.ts` (Step 3), `storage/storage.stub.spec.ts`

~~~
## TASK:
Write Karma/Jasmine unit tests for IbViewService covering CRUD and dialog orchestration.

## CONTEXT:
Repo: inobeta-ui. New view.service.ts: synchronous localStorage CRUD + MatDialog orchestration.
No NgRx. Uses IbStorageService and IbToastNotification.

## OBJECTIVE:
≥80% coverage on view.service.ts; all CRUD and dialog paths exercised.

## REQUIREMENTS:
1. Configure TestBed with IbViewService as the subject under test.
   Mock IbStorageService with a spy. Mock MatDialog to return controlled cold Observables.
   Mock IbToastNotification.
2. Test cases:
   a. `getViews` returns [] when storage key is missing (storage.get returns null).
   b. `getViews` filters out entries whose componentType does not match the argument.
   c. `addView` generates a unique id, stores the new array, returns the new snapshot.
   d. `saveView` updates only the `data` field; id and name are unchanged.
   e. `renameView` updates only the `name` field; data is unchanged.
   f. `deleteView` removes the entry by id; remaining entries are preserved.
   g. `openAddViewDialog` opens IbTableViewDialog; dialog close with confirmed:true emits
      the name; dialog close with confirmed:false (or dismiss) does not emit.
   h. `openDeleteViewDialog`: dialog close with confirmed:true → observable emits void;
      dialog close with confirmed:false → does not emit.
   i. `openRenameViewDialog`: emits new name on confirm; no emit on cancel.
3. Each test: single assertion per it(). No fdescribe/fit.

## CONSTRAINTS:
- Do not import NgRx. Do not use MockStore.
- Do not test toast notification content (implementation detail).
- Use NoopAnimationsModule in TestBed.

## OUTPUT:
New view.service.spec.ts.

## ACCEPTANCE CRITERIA:
- `ng test --include='**/ui/views/view.service.spec.ts' --watch=false` passes.
- Coverage report shows ≥80% statements on view.service.ts.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action.
~~~

---

### Step 9 — Unit tests: `IbTableViewGroup`

**Target executor:** `unit-jasmine-executor`
**Depends on:** Steps 3, 4

**Allowed files:**
- `src/app/inobeta-ui/ui/views/components/table-view-group/table-view-group.component.spec.ts`

**Read-only:** `table-view-group.component.ts` (Step 4), `view.service.ts` (Step 3)

~~~
## TASK:
Rewrite table-view-group.component.spec.ts for the new signal-based standalone component.
Remove all NgRx/MockStore/IbViewModule dependencies.

## CONTEXT:
Repo: inobeta-ui. The existing spec imports deleted symbols (IbViewModule, ibViews NgRx
state). It must be fully rewritten for the new interface.

## OBJECTIVE:
A passing spec covering the key behaviors of IbTableViewGroup with ≥80% coverage.

## REQUIREMENTS:
1. Configure TestBed with IbTableViewGroup as standalone component (no NgModule wrapper).
   Provide a spy IbViewService. Use RouterTestingModule. Use NoopAnimationsModule.
2. Helper: configure component with inputs groupName='issues', componentType='table',
   viewDataAccessor returning a fixed object.
3. Test cases:
   a. Component creates successfully.
   b. `initialViewId` matches a view → activeView() equals that view;
      ibViewChanged emitted with initial:true.
   c. `initialViewId` does not match → activeView() is defaultView; no ibViewChanged emission.
   d. `handleAddView()` → calls viewService.addView, sets activeView() to new view,
      emits ibViewChanged.
   e. `handleRemoveView()` → calls viewService.deleteView, resets activeView() to defaultView.
   f. `handleRenameView()` → calls viewService.renameView, updates activeView().name.
   g. `handleDuplicateView()` → calls viewService.duplicateView, sets activeView() to copy.
   h. `handleSaveView()` on defaultView → delegates to handleAddView flow.
   i. `handleSaveView()` on named view → calls viewService.saveView.
   j. `handleChangeView()` when not dirty → updates activeView() directly.
   k. `handleChangeView()` when dirty + defaultView → opens openSaveAsDialog.
   l. `handleChangeView()` when dirty + named view → opens openSaveChangesDialog.
   m. `_checkDirty()` determinism: {a:1, b:2} vs {b:2, a:1} → returns false (not dirty).
   n. `handleDiscardChanges()` → resets dirty to false.
4. No fdescribe/fit.

## CONSTRAINTS:
- Zero NgRx imports in the spec.
- Use jasmine.createSpyObj for IbViewService. Spy methods return of({...}) Observables.
- Do not test template rendering (focus on component logic).

## OUTPUT:
Updated spec file.

## ACCEPTANCE CRITERIA:
- `ng test --include='**/table-view-group/table-view-group.component.spec.ts' --watch=false` passes.
- Coverage ≥80% on table-view-group.component.ts.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action.
~~~

---

### Step 10 — Unit tests: `IbTable` view integration

**Target executor:** `unit-jasmine-executor`
**Depends on:** Steps 5, 6

**Allowed files:**
- `src/app/inobeta-ui/ui/kai-table/table.component.spec.ts`

**Read-only:** `table.component.ts` (Step 6 output), existing spec file (read full before editing)

~~~
## TASK:
Add a describe('with IbTableViewGroup') block to the existing IbTable spec covering
view orchestration. Do not break any existing test.

## CONTEXT:
Repo: inobeta-ui. table.component.spec.ts has 629+ lines across multiple describe blocks.
New behavior to cover: viewGroup content child wiring, applyViewToTable, getCurrentTableState,
URL init flow, Redux fallback.

## OBJECTIVE:
New describe block passes; no regressions; coverage maintained ≥80%.

## REQUIREMENTS:
1. Create a stub component with selector `ib-view-group` and matching @Input/@Output
   (groupName, componentType, stateAccessor, initialViewId, stateChanges$, ibViewChanged).
   Keep the stub local to this spec.
2. Test cases:
   a. `applyViewToTable({ initial: true, data: {...} })` → applies data to dataSource,
      does NOT call tableUrl.setViewState.
   b. `applyViewToTable({ initial: false, data: {...} })` → applies data AND calls
      tableUrl.setViewState with correct tableName and viewId.
   c. `getCurrentTableState()` returns object with filter, pageSize, aggregatedColumns, sort
      reflecting current dataSource values.
   d. URL has ibview param set → viewIdFromUrl() signal is non-null.
   e. URL empty + Redux has cached state (provideMockStore with ibKaiTable.tables) →
      paginator.pageSize receives the cached value (D1/A path).
3. Append the new describe block at the end of the file. Do not reorder existing blocks.
4. No fdescribe/fit.

## CONSTRAINTS:
- Do not change any existing test.
- Import stub from local definition; do not import real IbTableViewGroup.
- Use provideMockStore for Redux; do not use provideStore.

## OUTPUT:
Updated table.component.spec.ts (new describe block appended).

## ACCEPTANCE CRITERIA:
- `ng test --include='**/kai-table/table.component.spec.ts' --watch=false` passes.
- `grep "with IbTableViewGroup" table.component.spec.ts` → ≥1 match.
- No regressions in pre-existing describe blocks.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action.
~~~

---

### Step 11 — Example app: views integration demo

**Target executor:** `examples-executor`
**Depends on:** Steps 1–7

**Allowed files:** `src/app/examples/**/*`

**Read-only:** `public_api.ts` (Step 7), an existing table example (read to match the style)

~~~
## TASK:
Add or update a table example to demonstrate IbTableViewGroup usage end-to-end.

## CONTEXT:
Repo: inobeta-ui demo app. Existing examples are under src/app/examples/. The views
feature was previously demonstrated somewhere; if a file exists, update it.
If not, create a minimal new example component.

## OBJECTIVE:
A working demo showing add/rename/delete views with a real table.

## REQUIREMENTS:
1. Include `<ib-view-group>` as a content child of `<ib-kai-table>`.
2. Bind `[groupName]` to a fixed string (e.g., the tableName used for the demo table).
3. Show at least one table with filters so that the dirty state can be triggered.
4. Do not hardcode view data. Start with an empty view list.
5. Register the example in the app routing if needed (follow existing patterns).

## CONSTRAINTS:
- Do not modify library source files.
- Do not import from deep paths; use the public barrel.

## OUTPUT:
New or updated example component + any routing additions.

## ACCEPTANCE CRITERIA:
- `npm start` → example route renders without console errors.
- Adding a view, renaming it, refreshing the page → view is still present (localStorage persistence).
- `grep "ib-view-group" src/app/examples/` → ≥1 match.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action.
~~~

---

## 6. Impacted Areas

| File / Symbol | Change type |
|---|---|
| `ui/views/view.types.ts` | New — `IbViewSnapshot`, `DEFAULT_VIEW_ID` |
| `ui/views/view.tokens.ts` | New — `IB_VIEWS_STORAGE_KEY` |
| `ui/views/view.service.ts` | New — `IbViewService` |
| `ui/views/components/table-view-group/…` | Rewritten (standalone + signals) |
| `ui/views/components/view-list/…` | Migrated to standalone; `IView` → `IbViewSnapshot` |
| `ui/views/components/table-view/…` | Migrated to standalone; `IView` → `IbViewSnapshot` |
| `ui/views/components/default-table-view/…` | Migrated to standalone |
| `ui/views/components/view-dialog/…` | Migrated to standalone |
| `ui/views/index.ts` | New barrel |
| `ui/kai-table/table-url.service.ts` | Additive: 3 new methods, `ibview?` field in type |
| `ui/kai-table/table.component.ts` | Additive: `contentChild`, signals, new methods |
| `ui/kai-table/table.component.html` | Additive: `ng-content select` in toolbar |
| `ui/kai-table/table.module.ts` | Additive: `IbTableViewGroup` import + export |
| `public_api.ts` | Additive: new export line |

**New public API symbols:**
`IbViewSnapshot`, `DEFAULT_VIEW_ID`, `IB_VIEWS_STORAGE_KEY`,
`IbViewService`, `IbTableViewGroup`, `IbViewList`, `IbTableView`,
`IbDefaultTableView`, `IbTableViewDialog`

---

## 7. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| `applyViewToTable` double URL write: setting filter/sort on data source may trigger their own URL dispatch (via existing effects), then `setViewState` fires too | Medium | Executor (Step 6) must check if data source setters dispatch actions; if yes, apply values WITHOUT triggering dispatch (direct assignment bypassing the normal chain) |
| `ng-content select` placement: position may visually differ from old portal injection | Medium | Step 6 executor reads the full `table.component.html` before editing; must place ng-content in the same toolbar row as the existing action portal outlet |
| `stateChanges$` missing Observable for `aggregatedColumns`: may cause dirty not to react to column changes | Low | Document gap in code comment; aggregatedColumns changes are less frequent; can be addressed in a follow-up |
| `ibTableSelectLastQueryStringRaw` selector name: must match exactly what `store/index.ts` exports | Medium | Step 6 has explicit stop condition: NEED CLARIFICATION if selector is not found by that name |
| `contentChild` effect fires before filter is initialized: `applyViewToTable` may run before `filter.value` setter is ready | Medium | Step 6 must guard `applyViewToTable` with a null-check on `this.filter`; apply filter only after `filter.initialized` fires |
| Breaking change for consumers using old `IbViewModule`, `IbViewService (NgRx)`, `IView` | High | These were already removed in the pre-commit diff; this plan completes the transition. Add migration note to CHANGELOG |
| `initial?: boolean` stored in localStorage if executor forgets to strip it | Low | Step 3 constraint explicitly states: strip `initial` before writing; Step 9 must verify |

---

## 8. Validation Checklist

- [ ] `npm run lint` — no errors
- [ ] `npm run test-ci` — all passes, coverage ≥ 80%
- [ ] `npm run build` — demo app builds
- [ ] `npm run packagr` — library dist contains `IbViewSnapshot` in type declarations
- [ ] Manual: add view → refresh → view still listed (localStorage persistence)
- [ ] Manual: load page with `?tableId={"ibview":"<id>"}` in URL → correct view auto-selected
- [ ] Manual: change filter after loading view → undo/save buttons activate
- [ ] Manual: change view with dirty state → save-as/save dialog appears
- [ ] Manual: URL empty, Redux has cached filter → table initializes with cached filter; active view = "All"
- [ ] Manual: select view → URL updates atomically (ibview + ibfilter in one navigation, replaceUrl)
- [ ] `grep -r "IbViewModule\|selectTableViews\|ITableViewData\|ibViews" src/app/inobeta-ui/ui/views` → no matches
