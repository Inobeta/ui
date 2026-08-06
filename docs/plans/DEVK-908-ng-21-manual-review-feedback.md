# DEVK-908 — Angular 21 manual validation fixes — Manual review remediation

## References

- Original plan: `devk-908-supportare-angular-21`.
- Prior automated review: `docs/plans/DEVK-908-supportare-angular-21-feedback.md`.
- Review date: `2026-08-06`.
- Source: manual validation by the user.

## Verdict

**FAIL**

Manual validation found a reproducible clean-install Storybook regression, unusable mobile navigation, missing Kai Table mobile empty-state rendering, and broken side-menu icons. Two original side-menu requirements were explicitly replaced; the remaining DEVK-908 requirements are not invalidated by these findings.

## Manual review summary

- On GitLab CI, `npm ci` followed by `npm run build-storybook` consistently fails with `Cannot find native binding` from `oxc-parser`. The same failure reproduces locally on Linux x86_64 with Node 24.8.0 after `npm ci`, while an existing `node_modules` installed through `npm install` allowed the build to pass. Storybook CI passed before the Angular 21 migration.
- The example side menu is correctly grouped and routes correctly, but its Material list presentation is considered too rounded. The user requested square custom blocks using Material theme tokens, hover feedback, and collapsible groups that start expanded.
- Group icons display their ligature names (`table_rows`, `announcement`, `breakfast_dining`) instead of icons.
- On a mobile viewport, the always-open 16rem side menu occupies more than three quarters of the screen. The user requested an initially closed drawer opened through a hamburger button.
- At `/home/kai-table/mobile-empty`, headings render and the console remains clean, but all empty tables render no courtesy state. The same happens to other Kai Table examples when their mobile renderer receives no rows. Inspection confirms that the empty-state condition checks for missing columns instead of missing rows.

## Reviewed steps

### Step 8 — Creare il side menu degli esempi

- **Original plan state**: `[DONE]`
- **Reported behaviour**: the grouped navigation and routes work, but icons render as text, list items have an unwanted rounded Material appearance, groups cannot collapse, and the fixed menu makes mobile pages unusable.
- **Expected behaviour**: icons must render as required by the original plan. Custom square blocks and collapsible groups are newly requested. Responsive hamburger navigation explicitly replaces the original always-open, non-responsive requirement.
- **Classification**: `requirement change`
- **Issues found**:
  - `[BLOCKER]` `[requirement change]` The layout always reserves a fixed 16rem column with no breakpoint or drawer control (`src/app/examples/nav/nav.component.html:2-8`, `src/app/examples/nav/nav.component.css:7-27`, `src/app/examples/side-menu/app-side-menu.component.css:17-20`). Impact: on mobile viewports the menu consumes most of the screen and route content becomes unusable. Recommendation: move sidenav ownership to `NavComponent`, use an overlay drawer closed initially on mobile, expose an accessible hamburger toggle, and retain side mode on desktop.
  - `[WARNING]` `[implementation defect]` The template requests `fontSet="material-icons-two-tone"`, while the application loads only Material Icons and Material Icons Outlined (`src/app/examples/side-menu/app-side-menu.component.html:6-8`, `src/index.html:11`). Impact: `table_rows`, `announcement`, and `breakfast_dining` appear as text. Recommendation: use the loaded default font set or context-appropriate icons supported by it.
  - `[WARNING]` `[requirement change]` Navigation links are rendered through `mat-nav-list` and `mat-list-item`, whose Material styling produces the rejected rounded appearance (`src/app/examples/side-menu/app-side-menu.component.html:1-18`, `src/app/examples/side-menu/app-side-menu.component.ts:2-29`). Recommendation: replace list rendering with semantic custom group/link blocks, square edges, and Material system tokens for normal, hover, and active states.
  - `[WARNING]` `[missing requirement]` Groups have no local expanded/collapsed state (`src/app/examples/side-menu/app-side-menu.component.ts:8-65`, `src/app/examples/side-menu/app-side-menu.component.html:4-16`). Impact: the newly requested convenience behaviour is absent. Recommendation: make each group keyboard-accessible and collapsible, with every group expanded initially and no persistence.

### Step 11 — Migrare configurazione e addon a Storybook 10

- **Original plan state**: `[DONE]`
- **Reported behaviour**: Storybook can build from an existing `npm install` state but fails after a clean `npm ci`, both locally and in GitLab CI.
- **Expected behaviour**: Storybook 10 and `@storybook/angular-vite` must install reproducibly and build in the release pipeline.
- **Classification**: `regression`
- **Issues found**:
  - `[BLOCKER]` `[regression]` `@analogjs/vite-plugin-angular` resolves root `oxc-parser` 0.121.0 (`package-lock.json:304-316`), whose optional native bindings are declared (`package-lock.json:13810-13846`) but whose root Linux x64 binding package record is absent. Only Storybook's nested 0.127.0 Linux x64 binding is recorded (`package-lock.json:15568-15591`, `package-lock.json:15872-15888`). The CI job uses a clean `npm ci` before Storybook (`.gitlab-ci.yml:112-117`). Impact: the preview build exits 127 with `Cannot find native binding`, blocking documentation artifacts and release CI. Recommendation: repair the committed dependency lock from a clean install state and prove that clean `npm ci` installs the binding without changing the CI command or adding platform-specific runtime hacks.

### Step 14 — Verificare la release candidate v21

- **Original plan state**: `[DONE]`
- **Reported behaviour**: `/home/kai-table/mobile-empty` and other empty Kai Tables show no courtesy state in mobile mode, although headings and the rest of the page render without console errors.
- **Expected behaviour**: empty mobile tables should show the existing translated `common.noItems` fallback. This behaviour predates DEVK-908 and is not a new API request.
- **Classification**: `implementation defect`
- **Issues found**:
  - `[BLOCKER]` `[implementation defect]` Mobile card content is selected when columns exist, but the courtesy state is selected only when no data or action columns exist (`src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.ts:56-81`). With valid columns and zero rows, the row loop emits nothing and the empty state is false. Impact: every empty `IbKaiTable` rendered in mobile mode appears blank, including all four cases at `/home/kai-table/mobile-empty` (`src/app/examples/kai-table-example/kai-table-mobile-empty-example.ts:9-33`, `src/app/inobeta-ui/ui/kai-table/table.component.html:92-111`). Recommendation: base the empty-state decision on absence of rows while preserving loading and populated-row behaviour.
  - `[WARNING]` `[cross-cutting impact]` Existing mobile-table tests cover rows and source replacement but never assert the courtesy state with configured columns and an empty source (`src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.spec.ts:94-149`). Impact: the defect can pass the full suite. Recommendation: add direct regression coverage for empty, loading, and populated states.

## Confirmed requirement changes

### Change 1 — Replace Material list presentation

- **Original requirement**: Step 8 required the side menu to use `MatListModule` and render the grouped navigation using Angular Material list APIs.
- **New behaviour required**: render semantic custom blocks with square edges, hover feedback, active feedback, and Material theme tokens while preserving groups, routes, icons, and translations.
- **Nature of the contradiction**: the requested custom block rendering replaces the required `MatListModule`/`mat-list-item` presentation; both cannot remain the authoritative rendering approach.
- **Confirmed by the user**: “confermo tutto, riguardo la disposizione pure”.
- **Parts of the original plan this invalidates**: Step 8 requirement 4 and its implementation assumptions. Steps 13 and 14 must be rerun after the replacement; their unrelated requirements remain valid.

### Change 2 — Make navigation responsive

- **Original requirement**: Step 8 required the sidenav to remain always open and explicitly prohibited responsive behaviour.
- **New behaviour required**: keep desktop navigation open, but collapse it behind a hamburger button on mobile and open it only on demand.
- **Nature of the contradiction**: an always-open, non-responsive sidenav cannot also be initially hidden behind a mobile hamburger control.
- **Confirmed by the user**: “il side menu in modalità mobile si prende oltre 3/4 dello schermo rendendo la pagina inusabile, andrebbe collassato dietro un hamburger menu e aperto al bisogno”.
- **Parts of the original plan this invalidates**: Step 8 requirements 6 and 8. Step 9 must be extended only if the hamburger needs a new translated accessible label. Steps 13 and 14 require renewed validation.

## Impact analysis

- **Other steps of the original plan**:
  - Storybook lock repair reaches Steps 1, 11, 12, and 14 because each relies on reproducible dependency installation or `build-storybook`.
  - Side-menu changes reach Steps 8 and 14. Step 9 is affected only by a possible `examples.sideMenu.*` accessibility key; routes and existing translations remain unchanged.
  - The mobile empty-state defect was introduced before DEVK-908 and does not establish that DEVK-908 changed `kai-table-mobile` incorrectly. It reaches final regression validation and requires a missing unit test.
  - Steps 2–7 and 10 are not affected.
- **Components that depend on the changed behaviour**:
  - `NavComponent` must own the responsive Material sidenav because route content currently sits outside the sidenav container owned by `AppSideMenuComponent`.
  - `AppSideMenuComponent` becomes menu content rather than a nested layout shell.
  - `IbTable` delegates mobile rendering to `IbKaiTableMobileComponent`; fixing the latter restores the fallback for every `IbTable` consumer using mobile mode.
- **Application state, contracts between modules, API surface, persistence**:
  - Responsive drawer state and expanded-group state remain local to the example application.
  - Groups start expanded; neither group nor drawer state is persisted.
  - No route contract, NgRx state, URL state, library public API, data-source contract, or exported symbol changes.
- **Backward compatibility**:
  - Route URLs, link labels, grouping, and desktop navigation availability remain compatible.
  - Mobile navigation intentionally changes from permanently visible to on-demand.
  - The empty-state fix restores expected behaviour without changing component inputs or outputs.
  - Storybook dependency repair changes installation metadata, not the library API.
- **Automated tests and validations that assert the old behaviour**:
  - No side-menu specs currently assert Material list rendering or always-open behaviour. New tests are required for expansion and responsive drawer state.
  - `table-mobile.component.spec.ts` lacks empty-state coverage and must gain it.
  - Clean `npm ci` must become part of Storybook verification; a build from pre-existing `node_modules` is insufficient.
  - `npm run lint`, `npm run build`, `npm run test-ci`, and `npm run build-storybook` must be rerun.
- **Documentation**: Not affected. No library documentation should describe the application-local menu markup or drawer state.
- **Already-implemented features that must keep working**:
  - All existing route URLs and side-menu link groups.
  - Parent-height and sticky-parent Kai Table layout chains.
  - Storybook 10, Vite builder, version selector, stories, and MDX3 migration.
  - Main Menu, Breadcrumb, legacy uploader, and `IbSortHeader` removals.
  - Canonical uploader, `IbFilterPipe`, and deprecated `IbToolTestModule`.
  - Existing desktop and populated mobile table rendering, sorting, filtering, pagination, export, grouping, and URL state.
- **Work larger than initially suggested**:
  - Responsive navigation is larger than a CSS-only adjustment. The current side-menu component owns a nested sidenav while route content is its sibling in `NavComponent`; correct drawer behaviour requires relocating the sidenav shell and adding local breakpoint state. Scope remains limited to the example navigation files, one translation key if needed, and tests.
  - The custom collapsible design also requires component state and accessibility assertions, not CSS alone.

A manual review of these screens and CI paths does not invalidate unrelated DEVK-908 requirements or the original plan as a whole.

## Assumptions

- None.

## Remediation plan

### Remediation 1 — Repair clean Storybook dependency installation [agent: task-executor] [model: openai/gpt-5.6-sol] ✅ DONE [2026-08-06T11:59:42.004Z]

- **Dipendenze**: none.
- **File consentiti**: `package-lock.json`, `package.json`
- **Origine**: ordinary fix — `regression`.

~~~
## TASK:
Repair the dependency lock so a clean npm ci installs the native oxc-parser binding required by Storybook.

## CONTEXT:
DEVK-908 Steps 11, 12, and 14 require Storybook 10 to build. `@analogjs/vite-plugin-angular` uses root `oxc-parser` 0.121.0, but the committed lock declares its optional bindings without recording the root Linux x64 package. `npm ci` therefore fails during `npm run build-storybook` with `Cannot find native binding`. Existing node_modules created by npm install can hide the defect.

## OBJECTIVE:
Make clean, lockfile-driven installation reproducible on Linux x86_64 and allow Storybook to build without changing CI semantics.

## REQUIREMENTS:
1. Reproduce the failure from a clean node_modules state and record Node/npm versions.
2. Regenerate or minimally correct the lock from a genuinely clean install state so the matching oxc-parser native package is installed by npm ci.
3. Prefer a package-lock-only correction; change package.json only if required for deterministic cross-platform resolution.
4. Verify both the root 0.121.x and nested Storybook 0.127.x oxc-parser installations resolve their appropriate optional dependencies.
5. Review the lock diff and avoid unrelated dependency upgrades.

## CONSTRAINTS:
- Do not replace npm ci with npm install in `.gitlab-ci.yml`.
- Do not add retry scripts, postinstall downloads, broad cache deletion to CI, or a hard-coded Linux-only runtime dependency as a shortcut.
- Keep Storybook 10.5.5 and `@storybook/angular-vite`.
- Do not modify Storybook configuration, stories, application code, or the original plan.
- Stop and report if a clean lock regeneration still omits the required binding or causes broad unrelated dependency churn.

## OUTPUT:
Report the lockfile cause, changed dependency records, Node/npm versions, lock diff scope, and clean-install/build command results.

## ACCEPTANCE CRITERIA:
- `rm -rf node_modules && npm ci --cache .npm --prefer-offline --no-audit --no-fund` exits 0.
- A direct import of the installed root `oxc-parser` no longer throws `Cannot find native binding`.
- `npm run build-storybook` exits 0 after that clean npm ci.
- No CI command was weakened or replaced.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 2 — Redesign and collapse side-menu groups [agent: examples-executor] [model: openai/gpt-5.6-sol] ✅ DONE [2026-08-06T12:03:43.653Z]

- **Dipendenze**: none.
- **File consentiti**: `src/app/examples/side-menu/app-side-menu.component.ts`, `src/app/examples/side-menu/app-side-menu.component.html`, `src/app/examples/side-menu/app-side-menu.component.css`
- **Origine**: work caused by confirmed requirement change (Change 1), plus `missing requirement` and ordinary `implementation defect` repair.

~~~
## TASK:
Replace Material list rendering with square custom menu blocks, fix icons, and add collapsible groups.

## CONTEXT:
DEVK-908 Step 8 required Material list rendering. The user has replaced that presentation requirement with custom square blocks using Material theme tokens. Existing `fontSet="material-icons-two-tone"` does not match the fonts loaded by `src/index.html`, so icon names render as text. Groups must now be collapsible and start expanded.

## OBJECTIVE:
Provide an application-local grouped menu with working icons, square custom links, theme-token hover/active states, and accessible collapse controls.

## REQUIREMENTS:
1. Remove MatListModule, mat-nav-list, and mat-list-item usage from AppSideMenuComponent.
2. Make the component render only menu content; leave responsive sidenav ownership to Remediation 3.
3. Keep every existing group, route, label key, and context-appropriate group icon.
4. Render icons through the loaded Material icon font; replace individual names only when necessary and keep them contextually meaningful.
5. Use semantic buttons for group toggles and anchors for router links.
6. Initialize every group expanded and allow independent collapse/re-expansion.
7. Expose accessible expanded state and keyboard-operable controls.
8. Use Material system tokens for surface, text, hover, and active colours; use square edges rather than rounded list pills.

## CONSTRAINTS:
- Do not change route URLs, route order, translation labels, or router-active semantics.
- Do not add persistence, NgRx state, authentication logic, or responsive layout in this remediation.
- Do not hardcode user-visible text or colours.
- Preserve the flex/min-height requirements consumed by the navigation shell.
- Do not modify library source or the original plan.

## OUTPUT:
Report removed Material list dependencies, final group-state approach, icon-font correction, retained route set, and lint/build results.

## ACCEPTANCE CRITERIA:
- `npm run lint` exits 0.
- `npm run build` exits 0.
- All groups render expanded initially and can be independently collapsed and reopened.
- All three group icons render through a font set loaded by `src/index.html`.
- Link blocks have square edges and token-based hover/active styling.
- The route set remains identical to the current 16-link configuration.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 3 — Add responsive hamburger navigation [agent: examples-executor] [model: openai/gpt-5.6-sol] ✅ DONE [2026-08-06T12:06:02.680Z]

- **Dipendenze**: Remediation 2.
- **File consentiti**: `src/app/examples/nav/nav.component.ts`, `src/app/examples/nav/nav.component.html`, `src/app/examples/nav/nav.component.css`, `src/assets/i18n/it.json`
- **Origine**: work caused by confirmed requirement change (Change 2).

~~~
## TASK:
Move sidenav ownership to NavComponent and add mobile hamburger drawer behaviour.

## CONTEXT:
DEVK-908 Step 8 originally required an always-open, non-responsive sidenav. The user has replaced that requirement because the fixed 16rem menu consumes over three quarters of a mobile viewport. After Remediation 2, AppSideMenuComponent provides menu content only.

## OBJECTIVE:
Keep side navigation open in desktop side mode and provide an initially closed overlay drawer controlled by a hamburger button on mobile.

## REQUIREMENTS:
1. Make NavComponent own the Material sidenav container, sidenav, and route-content layout.
2. Use Angular CDK/Material public breakpoint and sidenav APIs.
3. On desktop, keep the menu open in side mode.
4. On mobile, use overlay mode, start closed, and expose a hamburger control that opens and closes it on demand.
5. Provide an accessible translated label under `examples.sideMenu.*` if a new label is required.
6. Preserve the router outlet and the full-height, `min-height: 0`, and overflow chain required by parent-height and sticky-parent examples.
7. Keep drawer state local and non-persistent.

## CONSTRAINTS:
- Do not change routes, redirects, menu groups, link labels, or route-content components.
- Do not add authentication or persistent responsive state.
- Do not hardcode visible or accessible text.
- Do not modify library source, unrelated translations, or the original plan.
- Do not reintroduce Main Menu or Breadcrumb dependencies.

## OUTPUT:
Report the breakpoint behaviour, sidenav ownership change, translation key if added, preserved layout chain, and validation results.

## ACCEPTANCE CRITERIA:
- `npm run lint` exits 0.
- `npm run build` exits 0.
- At widths up to 767px, route content uses the available width and the menu starts closed behind a hamburger control.
- The hamburger control opens and closes the overlay menu.
- Above the mobile breakpoint, the menu is open in side mode.
- `/home/kai-table/parent-height` and `/home/kai-table/sticky-parent` retain their height and overflow layout.
- Existing route URLs and link groups are unchanged.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 4 — Cover side-menu interactions [agent: unit-jasmine-executor] [model: openai/gpt-5.6-sol] ✅ DONE [2026-08-06T12:08:44.769Z]

- **Dipendenze**: Remediation 2, Remediation 3.
- **File consentiti**: `src/app/examples/side-menu/app-side-menu.component.spec.ts`, `src/app/examples/nav/nav.component.spec.ts`
- **Origine**: work caused by confirmed requirement changes (Changes 1 and 2) and `cross-cutting impact`.

~~~
## TASK:
Add Jasmine regression coverage for collapsible menu groups, icon configuration, and responsive navigation.

## CONTEXT:
The application previously had no side-menu or NavComponent specs. Remediations 2 and 3 replace Material list rendering, add local group state, and introduce breakpoint-driven drawer behaviour.

## OBJECTIVE:
Protect the new observable menu and responsive-navigation contracts without testing private Angular Material internals.

## REQUIREMENTS:
1. Verify all menu groups start expanded.
2. Toggle a real group control and assert its links hide and reappear and its accessible expanded state changes.
3. Verify configured group icons use the supported/default loaded font set.
4. Verify all current route links remain present.
5. Mock the public BreakpointObserver contract for NavComponent.
6. Verify desktop mode is open in side mode.
7. Verify mobile mode starts closed and the hamburger control opens and closes the drawer.
8. Use Angular CDK Material harnesses where available.

## CONSTRAINTS:
- Modify spec files only.
- Do not inspect private/protected Angular or Material properties.
- Do not use fdescribe, fit, xdescribe, or xit.
- Do not assert incidental CSS implementation details beyond the observable square-block classes and supported icon configuration.
- Do not weaken existing tests or coverage thresholds.

## OUTPUT:
Report added suites, public behaviours asserted, harnesses used, and targeted test results.

## ACCEPTANCE CRITERIA:
- `ng test --include='src/app/examples/side-menu/app-side-menu.component.spec.ts' --watch=false` exits 0.
- `ng test --include='src/app/examples/nav/nav.component.spec.ts' --watch=false` exits 0.
- Tests fail if groups stop starting expanded, icon configuration becomes unsupported, or mobile drawer initialization/toggling regresses.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 5 — Restore the mobile empty-table fallback [agent: kai-table-mobile-executor] [model: openai/gpt-5.6-sol] ✅ DONE [2026-08-06T12:10:08.964Z]

- **Dipendenze**: none.
- **File consentiti**: `src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.ts`
- **Origine**: ordinary fix — `implementation defect`.

~~~
## TASK:
Render the existing courtesy state when a mobile Kai Table has columns but no rows.

## CONTEXT:
At `/home/kai-table/mobile-empty`, IbTable delegates to IbKaiTableMobileComponent. The mobile template currently selects card content based on column presence and selects the empty state only when columns are absent. Valid columns plus an empty data source therefore render neither cards nor the courtesy state.

## OBJECTIVE:
Show the translated existing no-items fallback whenever the mobile renderer has no rows, without changing populated or loading behaviour.

## REQUIREMENTS:
1. Base empty-state rendering on the absence of connected/renderable rows rather than the absence of configured columns.
2. Keep `common.noItems`, the existing inbox icon, and existing styling.
3. Preserve the loading progress state and avoid showing the empty fallback while loading.
4. Preserve populated card rendering, infinite scroll, sorting, filters, actions, export, and row grouping.
5. Keep template expressions simple and move any non-trivial condition into a typed computed signal.

## CONSTRAINTS:
- Do not change public inputs, outputs, data-source contracts, exports, or desktop-table behaviour.
- Do not redesign the empty state or add new translations.
- Do not modify examples, specs, unrelated mobile components, or the original plan.
- Do not introduce private Material API access or `any`.

## OUTPUT:
Report the corrected condition/computed state, preserved behaviours, changed file, and package-build result.

## ACCEPTANCE CRITERIA:
- `npm run packagr` exits 0.
- A mobile table with valid columns and zero rows renders `.table-empty`.
- A loading table does not render the no-items fallback.
- A populated table renders cards and not the empty fallback.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 6 — Test the mobile empty-table fallback [agent: unit-jasmine-executor] [model: openai/gpt-5.6-sol] ✅ DONE [2026-08-06T12:13:00.483Z]

- **Dipendenze**: Remediation 5.
- **File consentiti**: `src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.spec.ts`
- **Origine**: ordinary fix — `cross-cutting impact`.

~~~
## TASK:
Add Jasmine regression tests for mobile empty, loading, and populated table rendering.

## CONTEXT:
The existing IbKaiTableMobileComponent suite tests populated rows and replacement data sources but does not assert the courtesy state when columns exist and the source emits no rows.

## OBJECTIVE:
Prevent valid-column empty tables from becoming visually blank again.

## REQUIREMENTS:
1. Configure at least one data column and an empty connected data source.
2. Assert that `.table-empty` and the existing no-items content render.
3. Assert that no mobile item cards render in the empty case.
4. Assert that loading suppresses the no-items fallback.
5. Assert that a populated source renders cards and suppresses the empty fallback.
6. Preserve all existing data-source cleanup, sorting, export, and row-group tests.

## CONSTRAINTS:
- Modify the spec only.
- Use public component inputs and DOM-observable output.
- Do not inspect private properties, suppress errors, skip/focus tests, or lower coverage thresholds.
- Do not modify production code or examples.

## OUTPUT:
Report assertions added, existing coverage preserved, targeted test result, full-suite result, and coverage totals.

## ACCEPTANCE CRITERIA:
- `ng test --include='src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.spec.ts' --watch=false` exits 0.
- `npm run test-ci` exits 0.
- Statements, lines, branches, and functions remain at least 80%.
- The new test fails against the old column-based empty-state condition.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 7 — Revalidate the repaired release candidate [agent: code-reviewer] [model: openai/gpt-5.6-sol] ✅ DONE [2026-08-06T12:21:43.624Z]

- **Dipendenze**: Remediation 1, Remediation 4, Remediation 6.
- **File consentiti**: `package.json`, `package-lock.json`, `.gitlab-ci.yml`, `angular.json`, `.storybook/`, `src/app/examples/nav/`, `src/app/examples/side-menu/`, `src/assets/i18n/it.json`, `src/app/inobeta-ui/ui/kai-table-mobile/`, `src/app/inobeta-ui/ui/kai-table/table.component.html`
- **Origine**: ordinary read-only verification — `cross-cutting impact`.

~~~
## TASK:
Perform a read-only integrated review of the manual-review remediations.

## CONTEXT:
The fixes affect clean Storybook dependency installation, application-local navigation presentation/responsiveness, and mobile Kai Table empty-state rendering. Unrelated DEVK-908 requirements remain baseline invariants.

## OBJECTIVE:
Return PASS only if clean installation, all original release gates, and the newly confirmed behaviours succeed without unrelated regressions.

## REQUIREMENTS:
1. Start from a clean node_modules state and run npm ci.
2. Run lint, library package build, application build, full CI tests, and Storybook build.
3. Confirm Storybook no longer reports a missing oxc-parser native binding.
4. Confirm route/link parity remains unchanged.
5. Confirm groups start expanded, can collapse, and use working icons and custom square blocks.
6. Confirm desktop side navigation and mobile hamburger drawer behaviour.
7. Confirm empty mobile tables show the courtesy state and populated tables still show cards.
8. Review the diff for unrelated changes to public APIs, routes, persistence, table logic, Storybook content, or original DEVK-908 removals.

## CONSTRAINTS:
- Read-only review; do not modify files.
- Do not infer success from a non-clean install.
- Do not accept missing manual behaviour merely because build commands pass.
- Keep every untouched DEVK-908 requirement in force.
- Do not modify the original plan or this remediation document.

## OUTPUT:
Return PASS/FAIL, exact command results, observable behaviour checks, coverage totals, route parity, and file references for every remaining issue.

## ACCEPTANCE CRITERIA:
- `rm -rf node_modules && npm ci --cache .npm --prefer-offline --no-audit --no-fund` exits 0.
- `npm run lint && npm run packagr && npm run build && npm run test-ci && npm run build-storybook` exits 0.
- No oxc-parser native-binding error occurs.
- All new side-menu and mobile-empty regression tests pass.
- Route URLs, public APIs, and unaffected DEVK-908 features remain unchanged.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~
