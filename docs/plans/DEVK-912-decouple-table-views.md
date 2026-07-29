# DEVK-912 — Decouple Kai-Table from Views Module

## 1. Goal

Remove all TypeScript-level import dependencies from `ui/kai-table/` to `ui/views/`.
The `IbViewModule` continues to exist as a standalone feature; consumers who want views
explicitly import `IbViewModule` alongside `IbKaiTableModule`. The kai-table must be
usable without `IbViewModule` and must not reference any views type internally.

## 2. Current State

### Coupling Inventory

| File | Severity | What couples |
|---|---|---|
| `table-data-source.ts` | **EXTREME** | Imports `IbTableViewGroup` (L18) and `IView` (L19). Stores `_view: IbTableViewGroup`. Sets `defaultView.data`, `viewDataAccessor`, calls `handleStateChanges()`, subscribes to `._activeView` BehaviorSubject, applies view data in `handleViewChange()`. |
| `table.component.ts` | **HIGH** | Imports `IbTableViewGroup` (L39). `@ContentChild(IbTableViewGroup)` (L103). `viewInit()` sets `.viewGroupName`, passes `view` to data source. `setupViewGroup()` reads `view.actions` QueryList to build `TemplatePortal[]`. |
| `table.component.html` | **LOW** | `<ng-content select="ib-table-view-group" />` (L3). Renders `actionPortals` derived from view actions. No TypeScript import — just a CSS selector. |
| `table.component.scss` | **LOW** | `:has(ib-table-view-group)` selector (L36) controls toolbar height / border. |
| `table-url.service.ts` | **MINIMAL** | `ibview` query param, `getActiveView()`, `handleViewChange()`. All use `string`, no views types imported. |
| `store/url-state/*` | **MINIMAL** | `view: string` field in `IbKaiTableParams`. `handleViewChange` action. No views types imported. |
| `table.component.spec.ts` | — | Imports `IbViewModule`, has view-specific test suites. |

The `table.module.ts` does **not** import `IbViewModule` — coupling is purely at the component/data-source level.

### Views module (reverse coupling)

`IbViewModule` depends on kai-table types (`IbKaiTableAction`, `IbTableUrlService`, `IbTableActionModule`). This reverse dependency is fine and should remain.

## 3. Assumptions / Open Questions

1. The `IView` / `ITableViewData` interfaces conceptually belong to the views module and should stay there.
2. The `ibview` query parameter in the URL service is a generic concept (a named state snapshot) and does not need to be removed — it's already decoupled via `string`.
3. The `ng-content select="ib-table-view-group"` in the template is acceptable as a CSS selector (no TypeScript dependency), but consumers who don't use views will have an unused projection slot — this is harmless.
4. No changes to the views module's NgRx store (`ibViewsFeature`) are needed.
5. Consumers currently import `IbViewModule` separately from `IbKaiTableModule` — this pattern continues to work.

## 4. Proposed Approach

### Strategy: Abstract Class + ContentChild

Introduce an **abstract class `IbTableViewsHost`** in `ui/kai-table/` that defines the contract the table needs from any "views" integration:

```
IbTableViewsHost (abstract, in kai-table)
├── setViewGroupName(name: string): void
├── setViewDataAccessor(fn: () => IbTableViewsData): void
├── handleStateChanges(changes$: Observable<unknown>): void
├── activeViewChanged: Observable<IbTableViewsData & { viewId: string }>
├── toolbarPortals: Portal<any>[]
└── dirty: boolean
```

Together with a data interface `IbTableViewsData` (filter, pageSize, aggregatedColumns, sort).

Then `IbTableViewGroup` **extends `IbTableViewsHost`** and implements these methods.
The table's `@ContentChild` switches from `IbTableViewGroup` to `IbTableViewsHost`.
The data source stores `IbTableViewsHost | null` instead of `IbTableViewGroup | null`.

This is **Angular-idiomatic** — the `@ContentChild` decorator matches on class hierarchy.
No DI token tricks needed; the content projection mechanism remains identical.

### What changes where

| Area | Change |
|---|---|
| `kai-table/` (new) | New file `table-views-host.ts` with `IbTableViewsData` and `IbTableViewsHost` |
| `kai-table/table-data-source.ts` | Replace `IbTableViewGroup` + `IView` imports with `IbTableViewsHost` + `IbTableViewsData`. Rewrite `_updateViewChangeSubscription()` and `handleViewChange()`. |
| `kai-table/table.component.ts` | Replace `@ContentChild(IbTableViewGroup)` with `@ContentChild(IbTableViewsHost)`. Rewrite `viewInit()` and `setupViewGroup()`. |
| `kai-table/table.component.html` | No change (CSS selector only). |
| `kai-table/table.component.scss` | Replace `:has(ib-table-view-group)` with class-based selector. |
| `kai-table/index.ts` | Export new types. |
| `kai-table/table.component.spec.ts` | Remove views-specific test suite; move view-related coverage to views module specs. |
| `kai-table/deprecation-guide.md` | Update if needed. |
| `views/view.module.ts` | Import `IbTableViewsHost` from kai-table (adds new dep, correct direction). |
| `views/components/table-view-group/` | `IbTableViewGroup extends IbTableViewsHost`. Implement abstract methods. |
| `views/index.ts` | No change needed (already exports `IbTableViewGroup`). |
| `views/store/views/table-view.ts` | No change needed (`IView` stays). |
| `public_api.ts` | Add export of `IbTableViewsHost`, `IbTableViewsData` (if not already re-exported via kai-table barrel). |
| `examples/` | No change (consumers project `<ib-table-view-group />` as before). |

## 5. Step-by-Step Plan

---

### Step 1 — Create `IbTableViewsHost` abstraction in kai-table

| Field | Value |
|---|---|
| **Executor** | `kai-table-executor` |
| **Allowed files** | `src/app/inobeta-ui/ui/kai-table/table-views-host.ts` (new), `src/app/inobeta-ui/ui/kai-table/index.ts` |
| **Read-only** | `src/app/inobeta-ui/ui/kai-table/table-data-source.ts`, `src/app/inobeta-ui/ui/kai-table/table.component.ts` (for context only) |
| **Objective** | Define the abstract contract that decouples the table from the views module. |
| **Dependencies** | None. |

~~~
## TASK:
Create a new file `table-views-host.ts` in the kai-table folder containing:

1. An interface `IbTableViewsData` with fields:
   - `filter: IbFilterSyntaxExtended`
   - `pageSize: number`
   - `aggregatedColumns: Record<string, string>`
   - `sort: Sort`

2. An abstract class `IbTableViewsHost` with:
   - `abstract setViewGroupName(name: string): void`
   - `abstract setViewDataAccessor(fn: () => IbTableViewsData): void`
   - `abstract handleStateChanges(changes$: Observable<unknown>): void`
   - `abstract readonly activeViewChanged: Observable<IbTableViewsData & { viewId: string }>`
   - `abstract readonly toolbarPortals: Portal<any>[]`
   - `abstract readonly dirty: boolean`

3. Update `kai-table/index.ts` barrel to export the new file.

## CONTEXT:
- Repo: inobeta-ui Angular component library
- File path: `src/app/inobeta-ui/ui/kai-table/`
- The `IbTableViewsHost` class serves as the abstraction layer between kai-table and any module that wants to provide view/snapshot functionality (currently only `ui/views`).
- `IbFilterSyntaxExtended` is imported from `../kai-filter/filter.types`.
- `Sort` is from `@angular/material/sort`.
- `Portal` is from `@angular/cdk/portal`.
- `Observable` is from `rxjs`.

## OBJECTIVE:
A clean abstract class that defines exactly what the table needs from a views provider, with zero references to the views module.

## REQUIREMENTS:
1. Define `IbTableViewsData` interface as described above.
2. Define `IbTableViewsHost` abstract class as described above.
3. Use proper Angular/RxJS imports (no `any` types).
4. Add barrel export in `index.ts`.
5. File must be importable from the kai-table barrel.

## CONSTRAINTS:
- Do not import anything from `../views/`.
- Do not modify any existing files except `index.ts`.
- Do not add `@Injectable()` or `@Directive()` decorators; it's a plain abstract class.
- Follow inobeta-ui naming conventions: `Ib` prefix, PascalCase.

## OUTPUT:
The new file content and the updated `index.ts` line.

## ACCEPTANCE CRITERIA:
- `npm run build` completes without errors.
- `grep -r "IbTableViewsHost" src/app/inobeta-ui/ui/kai-table/table-views-host.ts` has matches.
- `grep -r "IbTableViewsData" src/app/inobeta-ui/ui/kai-table/table-views-host.ts` has matches.
- `grep "table-views-host" src/app/inobeta-ui/ui/kai-table/index.ts` has a match.
- No references to `../views` in the new file.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 2 — Refactor `IbTableViewGroup` to extend `IbTableViewsHost`

| Field | Value |
|---|---|
| **Executor** | `task-executor` |
| **Allowed files** | `src/app/inobeta-ui/ui/views/components/table-view-group/table-view-group.component.ts`, `src/app/inobeta-ui/ui/views/components/table-view-group/table-view-group.component.html` |
| **Read-only** | `src/app/inobeta-ui/ui/kai-table/table-views-host.ts` |
| **Objective** | Make `IbTableViewGroup` implement the `IbTableViewsHost` abstract contract. |
| **Dependencies** | Step 1 completed. |

~~~
## TASK:
Refactor `IbTableViewGroup` to extend `IbTableViewsHost` and implement all abstract methods.

## CONTEXT:
- File: `src/app/inobeta-ui/ui/views/components/table-view-group/table-view-group.component.ts`
- The component currently has private/protected methods that the table reaches into directly.
- After this change, all interaction will go through the abstract methods defined in `IbTableViewsHost`.

## OBJECTIVE:
`IbTableViewGroup extends IbTableViewsHost` and properly implements every abstract member. The component's existing behavior must be preserved.

## REQUIREMENTS:
1. Add `import { IbTableViewsHost, IbTableViewsData } from "../../../kai-table/table-views-host";`
2. Add `import { Portal, TemplatePortal } from "@angular/cdk/portal";` (if not already present)
3. Change class declaration to `export class IbTableViewGroup extends IbTableViewsHost implements OnDestroy`
4. Implement `setViewGroupName(name: string)` — replace the existing `@Input() set viewGroupName(name)` setter logic. Keep the logic: bind `views$`, read active view from URL, seed `_activeView`.
5. Implement `setViewDataAccessor(fn: () => IbTableViewsData)` — replace existing `@Input() viewDataAccessor`. Change type from `() => ITableViewData` to `() => IbTableViewsData`. Update `checkViewDataChanges()` return type accordingly.
6. Implement `handleStateChanges(changes$: Observable<unknown>)` — existing method, already matches. Add `override` keyword.
7. Implement `get activeViewChanged(): Observable<IbTableViewsData & { viewId: string }>` — pipe `_activeView` through `filter(v => !!v && !v.initial)` and map to `IbTableViewsData & { viewId: string }`.
8. Implement `get toolbarPortals(): Portal<any>[]` — convert `this.actions.toArray()` to `TemplatePortal[]` and return them (same logic as currently in `table.component.ts` `setupViewGroup()`).
9. Implement `get dirty(): boolean` — return `this.dirty` (already exists).
10. Remove `@Input() viewDataAccessor` decorator (replaced by `setViewDataAccessor`).
11. Remove `@Input() set viewGroupName(name)` decorator (replaced by `setViewGroupName`).
12. Remove `@Output() ibViewChanged` and `@Output() ibResetView` — these were unused by the table (table subscribed directly to `_activeView`). Check if examples or consumers use them; if not, remove. If they are used, keep but note deprecation.

## CONSTRAINTS:
- Do not change the component's internal logic — only restructure to implement the abstract class.
- Do not modify template or SCSS.
- `IView` / `ITableViewData` types stay in the views module; they are used internally by `IbTableViewGroup`.
- The `IB_TABLE_VIEW_INTEGRATION` token is NOT used — the abstract class is sufficient for ContentChild resolution.

## OUTPUT:
The updated component file.

## ACCEPTANCE CRITERIA:
- `npm run build` completes without errors.
- `grep "extends IbTableViewsHost" src/app/inobeta-ui/ui/views/components/table-view-group/table-view-group.component.ts` matches.
- `grep "override" src/app/inobeta-ui/ui/views/components/table-view-group/table-view-group.component.ts` matches for overridden abstract methods.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 3 — Refactor `IbTableDataSource` to use `IbTableViewsHost`

| Field | Value |
|---|---|
| **Executor** | `kai-table-executor` |
| **Allowed files** | `src/app/inobeta-ui/ui/kai-table/table-data-source.ts` |
| **Read-only** | `src/app/inobeta-ui/ui/kai-table/table-views-host.ts` |
| **Objective** | Remove all direct imports of views types from the data source and use the abstract class instead. |
| **Dependencies** | Step 1 completed. Step 2 not required for compilation (abstract class alone is sufficient), but functionally needs Step 2. |

~~~
## TASK:
Refactor `IbTableDataSource` to remove all direct dependencies on the views module (`IbTableViewGroup`, `IView`) and use `IbTableViewsHost` and `IbTableViewsData` instead.

## CONTEXT:
- File: `src/app/inobeta-ui/ui/kai-table/table-data-source.ts`
- Lines 18-19 import `IbTableViewGroup` and `IView` from `../views/`.
- Lines 181-190: `set view()` / `get view()` stores and retrieves `_view: IbTableViewGroup | null`.
- Lines 401-435: `_updateViewChangeSubscription()` sets `defaultView.data`, `viewDataAccessor`, calls `handleStateChanges()`, subscribes to `._activeView`.
- Lines 437-457: `handleViewChange` applies view data to filter/sort/paginator/aggregation.
- Line 53: `_viewChangesSubscription` is a `Subscription | null`.
- Line 209: comment references `IbTableViewGroup`.

## OBJECTIVE:
The data source works with `IbTableViewsHost` only. All views-specific type references are gone.

## REQUIREMENTS:
1. Remove imports of `IbTableViewGroup` and `IView` (lines 18-19).
2. Add `import { IbTableViewsHost, IbTableViewsData } from "./table-views-host";`
3. Change `private _view: IbTableViewGroup | null` → `private _view: IbTableViewsHost | null`
4. Change `set view(view: IbTableViewGroup | null)` → `set view(view: IbTableViewsHost | null)`
5. Rewrite `_updateViewChangeSubscription()`:
   - Remove lines 402-409 (setting `defaultView.data`). The default view data is set by the views module or the table component, not the data source.
   - Remove lines 411-420 (setting `viewDataAccessor` function). Moved to table component.
   - Keep line 422-428: merge changes$ and call `handleStateChanges(changes$)` → already compatible with abstract class. Add null-check on `this._view`.
   - Replace lines 430-434: subscribe to `this._view.activeViewChanged` (the abstract observable) instead of `this._view._activeView`. The new observable already filters out `initial` values.
6. Rewrite `handleViewChange`:
   - Change parameter type from `(view: IView)` → `(data: IbTableViewsData & { viewId: string })`
   - Replace `view.data.pageSize` → `data.pageSize`, `view.data.aggregatedColumns` → `data.aggregatedColumns`, etc.
   - Replace `view.data.filter` → `data.filter`
   - Replace `view.id` → `data.viewId`
   - When dispatching `urlStateActions.handleViewChange`, use `data.viewId` for the `view` field.
7. Update comment on line 207 from "IbTableViewGroup listens" → "IbTableViewsHost listens" (or remove).
8. In `disconnect()` (line 578): ensure `this._viewChangesSubscription?.unsubscribe()` still works (it will, we're just changing the source).

## CONSTRAINTS:
- Do NOT change the `aggregate` Subject or aggregation logic.
- Do NOT change `_updateChangeSubscription()` (the main data pipeline).
- Do NOT change filter/sort/paginator setter/getter logic.
- Do NOT import anything from `../views/`.
- The `view` setter is called from `table.component.ts` (Step 4 will update that).

## OUTPUT:
The updated `table-data-source.ts` file.

## ACCEPTANCE CRITERIA:
- `npm run build` completes without errors (Step 4 must also be done for full compilation, but this file alone should have no TS errors).
- `grep "IbTableViewGroup" src/app/inobeta-ui/ui/kai-table/table-data-source.ts` has NO matches.
- `grep "from.*\.\./views" src/app/inobeta-ui/ui/kai-table/table-data-source.ts` has NO matches.
- `grep "IbTableViewsHost" src/app/inobeta-ui/ui/kai-table/table-data-source.ts` has matches.
- `grep "IbTableViewsData" src/app/inobeta-ui/ui/kai-table/table-data-source.ts` has matches.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 4 — Refactor `IbTable` component to use `IbTableViewsHost`

| Field | Value |
|---|---|
| **Executor** | `kai-table-executor` |
| **Allowed files** | `src/app/inobeta-ui/ui/kai-table/table.component.ts` |
| **Read-only** | `src/app/inobeta-ui/ui/kai-table/table-views-host.ts`, `src/app/inobeta-ui/ui/kai-table/table-data-source.ts` |
| **Objective** | Remove the import of `IbTableViewGroup`, switch to `@ContentChild(IbTableViewsHost)`, and rewrite view-related logic. |
| **Dependencies** | Steps 1, 3 completed (Step 2 needed for full runtime functionality but not for compilation). |

~~~
## TASK:
Refactor `IbTable` to remove the direct import of `IbTableViewGroup` and use `IbTableViewsHost` through ContentChild instead. Rewrite `viewInit()` and `setupViewGroup()` accordingly.

## CONTEXT:
- File: `src/app/inobeta-ui/ui/kai-table/table.component.ts`
- Line 39: `import { IbTableViewGroup } from "../views";` — MUST BE REMOVED.
- Line 103: `@ContentChild(IbTableViewGroup) view!: IbTableViewGroup;` — MUST CHANGE.
- Lines 240-278: `viewInit()` and its call sites in `ngAfterContentInit()`.
- Lines 301-310: `setupViewGroup()`.

## OBJECTIVE:
The `IbTable` class has zero imports from `../views/`. The `view` ContentChild is now typed as `IbTableViewsHost`. All interactions go through the abstract class methods.

## REQUIREMENTS:
1. Remove `import { IbTableViewGroup } from "../views";` (line 39).
2. Add `import { IbTableViewsHost } from "./table-views-host";`
3. Change line 103: `@ContentChild(IbTableViewGroup) view!: IbTableViewGroup;` → `@ContentChild(IbTableViewsHost) viewHost!: IbTableViewsHost;`
4. Rewrite `viewInit()` (lines 240-244):
   - Replace `this.view.viewGroupName = this.tableName;` → `this.viewHost.setViewGroupName(this.tableName);`
   - Replace `this.dataSource.view = this.view;` → `this.dataSource.view = this.viewHost;` (the data source now accepts `IbTableViewsHost | null`, per Step 3)
   - Replace `this.setupViewGroup();` → `this.setupViewGroup();` (method name stays, content changes)
5. Update all references from `this.view` to `this.viewHost` in `ngAfterContentInit()` (lines 269, 276).
6. Rewrite `setupViewGroup()` (lines 301-310):
   - Replace the loop that reads `this.view.actions.toArray()` with: 
     ```
     this.actionPortals.push(
       new TemplatePortal(this.filter.hideFilterAction.templateRef, this.filter.hideFilterAction.viewContainerRef)
     );
     this.actionPortals.push(...this.viewHost.toolbarPortals);
     ```
   - Note: `toolbarPortals` from the abstract class already returns `Portal<any>[]`, pre-converted.
7. Rename the `view` ContentChild to `viewHost` everywhere to avoid confusion (there was no public `view` property before, so this is safe).
8. Add `viewDataAccessor` setup: before `setViewGroupName`, also set `this.viewHost.setViewDataAccessor(() => /* table state snapshot */)`. The viewDataAccessor function returns `IbTableViewsData`:
   ```typescript
   this.viewHost.setViewDataAccessor(() => ({
     filter: this.filter.selectedCriteria,
     pageSize: this.paginator.pageSize,
     aggregatedColumns: this.dataSource.aggregatedColumns,
     sort: { ...this.dataSource.sortState }
   }));
   ```
   This replaces the logic that was in `_updateViewChangeSubscription()` lines 411-420 (removed in Step 3).
9. Add a host binding for the CSS selector: `@HostBinding('class.ib-table--has-views') get hasViews() { return !!this.viewHost; }`

## CONSTRAINTS:
- Do NOT change `ngOnInit()` or `ngOnDestroy()`.
- Do NOT change mobile-related code.
- Do NOT change `doExport()`, `setPaginatorState()`, or `updateSortFromMobile()`.
- Do NOT change the template (HTML) — that's Step 5's concern if needed.
- `IbTableViewsHost` is resolved via ContentChild; it will be undefined if no views are projected.
- Keep the `setTimeout(() => viewInit())` pattern (NG0100 workaround).

## OUTPUT:
The updated `table.component.ts` file.

## ACCEPTANCE CRITERIA:
- `npm run build` completes without errors (may need Step 5 CSS change too).
- `grep "IbTableViewGroup" src/app/inobeta-ui/ui/kai-table/table.component.ts` has NO matches.
- `grep "from.*\.\./views" src/app/inobeta-ui/ui/kai-table/table.component.ts` has NO matches.
- `grep "IbTableViewsHost" src/app/inobeta-ui/ui/kai-table/table.component.ts` has matches.
- `grep "viewHost" src/app/inobeta-ui/ui/kai-table/table.component.ts` has matches.
- `grep "ib-table--has-views" src/app/inobeta-ui/ui/kai-table/table.component.ts` has a match.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 5 — Update SCSS to remove `ib-table-view-group` element selector dependency

| Field | Value |
|---|---|
| **Executor** | `kai-table-executor` |
| **Allowed files** | `src/app/inobeta-ui/ui/kai-table/table.component.scss` |
| **Read-only** | `src/app/inobeta-ui/ui/kai-table/table.component.ts` |
| **Objective** | Replace element-selector based toolbar styling with a host-class based approach. |
| **Dependencies** | Step 4 (the new `.ib-table--has-views` host class). |

~~~
## TASK:
Update the SCSS to use `.ib-table--has-views` (set as host class by `IbTable` in Step 4) instead of `:has(ib-table-view-group)` for toolbar height/border styling.

## CONTEXT:
- File: `src/app/inobeta-ui/ui/kai-table/table.component.scss`
- Lines 36-40:
  ```scss
  &:has(ib-table-view-group),
  &:has(> section:not(:empty)) {
    height: 56px;
    border-bottom: 1px solid var(--ib-table-outline-color-private);
  }
  ```
- The `:has(ib-table-view-group)` selector creates a visual dependency on the views component element.
- Step 4 adds `@HostBinding('class.ib-table--has-views')` to `IbTable` when `viewHost` is present.

## OBJECTIVE:
The toolbar height and border-bottom are triggered by the `.ib-table--has-views` class, not by the presence of `ib-table-view-group` DOM element. The `:has(> section:not(:empty))` fallback is preserved.

## REQUIREMENTS:
1. Replace the two `:has(...)` selectors with:
   ```scss
   &.ib-table--has-views,
   &:has(> section:not(:empty)) {
     height: 56px;
     border-bottom: 1px solid var(--ib-table-outline-color-private);
   }
   ```

## CONSTRAINTS:
- Do not change any other SCSS rules.
- Do not change CSS custom properties.
- Keep the `:has(> section:not(:empty))` fallback for consumers who use toolbar actions without views.

## OUTPUT:
The updated SCSS file.

## ACCEPTANCE CRITERIA:
- `npm run build` completes without errors.
- `grep "ib-table-view-group" src/app/inobeta-ui/ui/kai-table/table.component.scss` has NO matches.
- `grep "ib-table--has-views" src/app/inobeta-ui/ui/kai-table/table.component.scss` has a match.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 6 — Update `IbTable` unit tests (remove views coupling)

| Field | Value |
|---|---|
| **Executor** | `unit-jasmine-executor` |
| **Allowed files** | `src/app/inobeta-ui/ui/kai-table/table.component.spec.ts` |
| **Read-only** | `src/app/inobeta-ui/ui/kai-table/table-views-host.ts`, `src/app/inobeta-ui/ui/kai-table/table.component.ts` |
| **Objective** | Remove `IbViewModule` import from table spec. Move view-related test logic to views module spec or refactor to use the abstract host. |
| **Dependencies** | Steps 1-5 completed. |

~~~
## TASK:
Refactor the table component spec to remove the direct dependency on `IbViewModule`.

## CONTEXT:
- File: `src/app/inobeta-ui/ui/kai-table/table.component.spec.ts`
- Line 37: `import { IbViewModule } from "../views";` — must be removed.
- Line 131: `describe("with IbView", () => { ... })` — test suite that tests view creation/selection.
- Line 469: `IbViewModule` in `imports` array.
- Line 484: `views: []` in store mock.
- Line 577: `<ib-table-view-group></ib-table-view-group>` in component template.

## OBJECTIVE:
The table spec compiled and passed without importing `IbViewModule`. View-specific tests are extracted or adapted to use a stub `IbTableViewsHost`.

## REQUIREMENTS:
1. Create a stub class `IbTableViewsHostStub` (in the spec file or a new `.stub.spec.ts`) that extends `IbTableViewsHost` with no-op implementations.
2. Remove `import { IbViewModule } from "../views";`
3. Add import of `IbTableViewsHost` and the new stub.
4. Replace `IbViewModule` in the TestBed `imports` array with the stub's hosting module/setup.
5. For the `describe("with IbView", ...)` suite (line 131):
   - If the tests exercise the views module's own components (view-list, buttons, dialogs), these tests should be moved to `src/app/inobeta-ui/ui/views/components/table-view-group/table-view-group.component.spec.ts` as a separate task.
   - If the tests exercise the table's integration with views (e.g., `should create a view`), adapt them to use the stub and verify that the table calls the correct abstract methods.
6. Remove the `<ib-table-view-group></ib-table-view-group>` from spec templates that don't need it.
7. Remove `views: []` from store mocks that don't need it.

## CONSTRAINTS:
- Maintain ≥80% coverage on the table spec. If moving tests to views module, ensure coverage doesn't drop below threshold.
- Do not remove test coverage that validates the table's integration contract with `IbTableViewsHost`.
- Use `xdescribe`/`xit` with comments for tests that need to be moved later, rather than deleting them outright, if moving them in this step is too large.

## OUTPUT:
The updated spec file and any new stub file.

## ACCEPTANCE CRITERIA:
- `npm run test-ci` passes with ≥80% coverage.
- `grep "IbViewModule" src/app/inobeta-ui/ui/kai-table/table.component.spec.ts` has NO matches.
- `grep "from.*\.\./views" src/app/inobeta-ui/ui/kai-table/table.component.spec.ts` has NO matches.
- All tests in the file pass.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 7 — Move view-specific tests to views module

| Field | Value |
|---|---|
| **Executor** | `unit-jasmine-executor` |
| **Allowed files** | `src/app/inobeta-ui/ui/views/components/table-view-group/table-view-group.component.spec.ts` (new or update existing) |
| **Read-only** | `src/app/inobeta-ui/ui/kai-table/table.component.spec.ts` (to reference moved tests) |
| **Objective** | Ensure the views module has adequate test coverage for view creation, selection, renaming, duplication, and deletion — tests that were previously covered by the table's spec. |
| **Dependencies** | Step 6 completed (to know which tests were `xit`ed). |

~~~
## TASK:
Ensure the `IbTableViewGroup` component has unit tests covering: view CRUD operations, `dirty` flag tracking, `activeViewChanged` emissions, `toolbarPortals` generation, and integration with `IbViewService` and NgRx store.

## CONTEXT:
- The table component spec (`table.component.spec.ts`) previously had a `describe("with IbView", ...)` suite with tests like "should create a view" and "should save view" (xit).
- These tests exercise `IbTableViewGroup` behavior through the table's integration.
- After Step 6, some of these tests may be `xit`ed or removed.
- The views module already has `view.service.spec.ts` and `store/views/reducer.spec.ts`.

## OBJECTIVE:
Comprehensive test coverage for `IbTableViewGroup` that covers all public API methods and interactions.

## REQUIREMENTS:
1. Read the existing test file (if any) at `table-view-group.component.spec.ts`. Create if missing.
2. Write tests covering:
   - `setViewGroupName(name)`: binds `views$` selector, reads active view from URL.
   - `setViewDataAccessor(fn)`: stores the function.
   - `handleStateChanges(changes$)`: subscribes and sets `dirty`.
   - `activeViewChanged`: emits when `_activeView` changes (excluding `initial` emissions).
   - `toolbarPortals`: returns portals from projected `IbKaiTableAction` elements.
   - `handleAddView`, `handleSaveView`, `handleChangeView`, `handleDiscardChanges`: CRUD flows with dialog interactions.
   - `checkViewDataChanges`: deep comparison with `viewDataAccessor` result.
3. Mock dependencies: `IbViewService`, `IbTableUrlService`, MatDialog, Store, TranslateService, IbToastNotification.
4. Use TestBed with `IbViewModule` or a test-specific module that provides the view-group component.

## CONSTRAINTS:
- Follow the project's testing conventions: `NoopAnimationsModule`, `TranslateModule.forRoot()`, CDK Harnesses where applicable.
- Use `fakeAsync`/`tick` for async dialog flows.
- Maintain ≥80% coverage on the views module.

## OUTPUT:
The updated (or new) spec file.

## ACCEPTANCE CRITERIA:
- `npm run test-ci` passes with ≥80% coverage.
- `grep -c "it(" src/app/inobeta-ui/ui/views/components/table-view-group/table-view-group.component.spec.ts` >= 5 (at least 5 new/updated tests).
- All tests pass.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 8 — Update public API and barrel exports

| Field | Value |
|---|---|
| **Executor** | `task-executor` |
| **Allowed files** | `src/app/inobeta-ui/ui/kai-table/index.ts`, `public_api.ts` |
| **Read-only** | `src/app/inobeta-ui/ui/kai-table/table-views-host.ts` |
| **Objective** | Ensure `IbTableViewsHost` and `IbTableViewsData` are properly exported through the library's public API. |
| **Dependencies** | Step 1 completed (index.ts already updated). |

~~~
## TASK:
Verify and fix public API exports for the new abstraction types.

## CONTEXT:
- Step 1 added `export * from "./table-views-host";` to `kai-table/index.ts`.
- `public_api.ts` line 10 already does `export * from './src/app/inobeta-ui/ui/kai-table/index';`, so the new types should be automatically re-exported.
- Verify this is the case.

## OBJECTIVE:
`IbTableViewsHost` and `IbTableViewsData` are importable from `public_api`.

## REQUIREMENTS:
1. Verify `kai-table/index.ts` exports `table-views-host`.
2. Verify `public_api.ts` re-exports the kai-table barrel (it already does, line 10).
3. If not, add the export.
4. Run `npm run packagr` to verify the library builds correctly and the types are in the dist.

## CONSTRAINTS:
- Do not remove any existing exports.
- Do not add a new line to `public_api.ts` unless the existing barrel chain is broken.

## OUTPUT:
Confirmation that the types are exported, or the minimal fix needed.

## ACCEPTANCE CRITERIA:
- `npm run packagr` completes without errors.
- `grep "IbTableViewsHost" dist/` (or equivalent check) confirms the type is in the build output.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 9 — Update examples (if needed)

| Field | Value |
|---|---|
| **Executor** | `examples-executor` |
| **Allowed files** | `src/app/examples/kai-table-example/*.ts` |
| **Read-only** | — |
| **Objective** | Ensure all existing examples using `<ib-table-view-group />` continue to work. |
| **Dependencies** | Steps 1-5, 8 completed. |

~~~
## TASK:
Verify that all three example files using `IbViewModule` + `<ib-table-view-group />` still compile and render correctly after the decoupling. Fix if needed.

## CONTEXT:
- Three example files import `IbViewModule` from `public_api` and project `<ib-table-view-group />` inside `<ib-kai-table>`:
  - `kai-table-full-example.ts`
  - `kai-table-with-routing.ts`
  - `server-side/kai-table-api-example.ts`
- The decoupling should be transparent to consumers — no API changes are expected.

## OBJECTIVE:
All examples compile and display the table with views functionality unchanged.

## REQUIREMENTS:
1. Run `npm start` and visually verify the examples with views still work.
2. If compilation breaks, fix the imports or component setup.
3. No changes should be needed, but verify.

## CONSTRAINTS:
- Do not change the examples' visual layout or behavior.
- Do not remove views from examples that currently use them.

## OUTPUT:
Confirmation that examples work, or the minimal fix.

## ACCEPTANCE CRITERIA:
- `npm run build` completes without errors.
- `npm start` renders the kai-table examples with view controls visible and functional.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 10 — Update Storybook stories (if needed)

| Field | Value |
|---|---|
| **Executor** | `storybook-executor` |
| **Allowed files** | `src/app/inobeta-ui/ui/kai-table/table.stories.ts`, `src/app/inobeta-ui/ui/kai-table/table.mdx` |
| **Read-only** | — |
| **Objective** | Update Storybook stories and MDX documentation to reflect the decoupled architecture. |
| **Dependencies** | Steps 1-8 completed. |

~~~
## TASK:
Update Storybook stories and documentation to reflect that views are now an optional, external module.

## CONTEXT:
- `table.stories.ts`: may or may not reference views.
- `table.mdx`: lines 9, 463, 467, 474 reference `ib-table-view-group`, `IbViewModule`, and `tableName` for views.
- `deprecation-guide.md`: line 19 mentions `ib-table-view-group` in `IbViewModule`.

## OBJECTIVE:
Documentation is accurate for the decoupled architecture. Stories compile and render.

## REQUIREMENTS:
1. Verify `table.stories.ts` compiles. Fix any views-related imports if needed.
2. Update `table.mdx` to clarify that `IbViewModule` is a separate import for view/snapshot functionality.
3. Update `deprecation-guide.md` references if needed.

## CONSTRAINTS:
- Do not remove documentation about views — just clarify the import relationship.

## OUTPUT:
Updated story/mdx files if needed.

## ACCEPTANCE CRITERIA:
- `npm run storybook` builds without errors.
- Storybook renders the kai-table stories.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

## 6. Impacted Areas

### Files modified (library source)
| File | Change |
|---|---|
| `ui/kai-table/table-views-host.ts` | **NEW** — abstract contract |
| `ui/kai-table/index.ts` | Add barrel export |
| `ui/kai-table/table-data-source.ts` | Remove views imports, use abstract class |
| `ui/kai-table/table.component.ts` | Remove views import, ContentChild switch |
| `ui/kai-table/table.component.scss` | Replace element selector with class |
| `ui/kai-table/table.component.spec.ts` | Remove IbViewModule dependency |
| `ui/views/components/table-view-group/table-view-group.component.ts` | Extend `IbTableViewsHost` |

### Files modified (docs/examples)
| File | Change |
|---|---|
| `ui/kai-table/table.mdx` | Clarify views as optional module |
| `ui/kai-table/deprecation-guide.md` | Minimal update if needed |
| `ui/kai-table/table.stories.ts` | Verify/fix if needed |

### Public API changes
| Symbol | Action |
|---|---|
| `IbTableViewsHost` (abstract class) | **NEW** — exported from `public_api.ts` via kai-table barrel |
| `IbTableViewsData` (interface) | **NEW** — exported from `public_api.ts` via kai-table barrel |
| `IbTableViewGroup` | Now extends `IbTableViewsHost` (backward compatible for ContentChild) |
| All existing public exports | **UNCHANGED** |

## 7. Risks

1. **Breaking change risk (LOW):** `IbTableViewGroup` now extends `IbTableViewsHost`. Its public API (inputs/outputs) may have changed slightly (`viewGroupName` and `viewDataAccessor` move from `@Input` setter to abstract method override). Consumers who use `IbTableViewGroup` programmatically (outside an `<ib-kai-table>` context) may be affected. However, `IbTableViewGroup` is typically used only as a content child of `ib-kai-table`, so this risk is minimal.

2. **Runtime regression risk (MEDIUM):** The view initialization flow (`viewInit()`) is sensitive to timing. The current code uses `setTimeout` for NG0100 workarounds. The refactored code must preserve the same timing, especially around filter initialization and view-group wiring.

3. **Coverage gap risk (MEDIUM):** View-specific tests in `table.component.spec.ts` need to be moved to the views module. If not done properly, coverage may drop below the 80% threshold.

4. **Storybook/Examples breakage (LOW):** Existing examples project `<ib-table-view-group />` via `ng-content`, which still works. The `IbTable` still uses `@ContentChild(IbTableViewsHost)` which resolves `IbTableViewGroup` through class hierarchy. No consumer changes needed.

5. **CSS regression (LOW):** The `:has(ib-table-view-group)` → `.ib-table--has-views` change could cause visual differences if the class is applied at a different time than the element is in the DOM. The `@HostBinding` approach should be equivalent.

6. **Re-export chain (LOW):** `public_api.ts` → `kai-table/index.ts` → `table-views-host.ts`. If any link breaks, the new types won't be publicly available. Step 8 verifies this.

## 8. Validation Checklist

- [ ] `npm run lint` passes with no new errors
- [ ] `npm run test-ci` passes with ≥80% coverage
- [ ] `npm run build` (demo app) compiles
- [ ] `npm run packagr` (library build) succeeds
- [ ] `npm run storybook` builds without errors
- [ ] Manual: `npm start` — kai-table example with views renders correctly:
  - [ ] Default view ("All") button visible
  - [ ] "Add view" button works
  - [ ] Saving a view persists it
  - [ ] Switching views restores filter/sort/pagination
  - [ ] View rename/duplicate/delete works
  - [ ] "Dirty" indicator (*) appears when table state changes
  - [ ] URL query string contains `ibview` parameter
- [ ] Manual: `npm start` — kai-table example WITHOUT `<ib-table-view-group>` works correctly (no views toolbar shown, no errors in console)
- [ ] `grep -r "from.*\.\./views" src/app/inobeta-ui/ui/kai-table/` returns NO matches (except in test files if they still reference `IbViewModule` after Step 6)
