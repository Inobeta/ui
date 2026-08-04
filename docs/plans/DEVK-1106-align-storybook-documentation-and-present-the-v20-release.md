# DEVK-1106 — Align Storybook documentation and present the v20 release

- Approved at: 2026-08-04T15:19:33.945Z

> Documentation-only work: review all maintained Storybook pages, stories, README files, and attached consumer Markdown; update the v20 “What’s New” page without modifying operational code.

## Plan lineage

- Ancestors: None

## 1. Goal

Deliver trustworthy English documentation that reflects the library as implemented at the current v20 release state.

Users will receive:

- A concise v20 “What’s New” page based on the delta from tag `19.0.0`.
- A clear summary of Angular 20 support, the Kai Table refactoring, optional/restored Views, and `tableHeight`.
- Explicit Kai Table input/output migration information, including the potentially disruptive default `tableHeight="parent"`.
- Explicit Main Menu and Breadcrumbs deprecation notices.
- Existing Storybook pages, stories, README files, and attached consumer Markdown corrected wherever they contradict current code.
- No speculative documentation for functionality that is not already documented.
- No runtime, library, example application, CI, package, or generated documentation changes.

## 2. Current State

Static repository inspection established the following:

- The release baseline is tag `19.0.0`.
- The current branch contains the v20 implementation and its related ticket history.
- `src/whats_new.mdx` is an early draft. It currently covers only DEVK-693, contains an unsupported Node.js 24.8+ recommendation, and does not summarize the main Kai Table work.
- `.storybook/main.ts` discovers:
  - `src/**/*.mdx`
  - `src/**/*.stories.@(js|jsx|ts|tsx)`
- Storybook commands are defined in `package.json`:
  - `npm run storybook`
  - `npm run build-storybook`
- Storybook static output is configured under `dist/storybook/ui`.
- The main release subjects confirmed for `src/whats_new.mdx` are:
  - DEVK-693 — Angular 20 compatibility.
  - DEVK-912 — Kai Table decoupled from the Views implementation.
  - DEVK-1066 — Kai Table architecture, state, signal API, and data-source refactoring.
  - DEVK-1065 — restored optional table Views.
  - DEVK-1046 — `tableHeight`, defaulting to `"parent"`.
- DEVK-1000, DEVK-1001, DEVK-1002, DEVK-1078, DEVK-342, DEVK-1021, and DEVK-1105 must not appear in the v20 “What’s New” page.
- Current Kai Table behavior is defined primarily by:
  - `src/app/inobeta-ui/ui/kai-table/table.component.ts`
  - `src/app/inobeta-ui/ui/kai-table/table.component.html`
  - `src/app/inobeta-ui/ui/kai-table/table.component.scss`
  - `src/app/inobeta-ui/ui/kai-table/table.types.ts`
  - `src/app/inobeta-ui/ui/kai-table/table-state-resolver.ts`
  - `src/app/inobeta-ui/ui/kai-table/table-url-codec.ts`
  - `src/app/inobeta-ui/ui/kai-table/local-data-source.ts`
  - `src/app/inobeta-ui/ui/kai-table/remote-data-source.ts`
  - `src/app/inobeta-ui/ui/kai-table/table-views-host.ts`
  - `src/app/inobeta-ui/ui/views/`
- Verified Kai Table migration facts include:
  - `tableName` is required.
  - Table inputs are signal inputs and programmatic reads use signal invocation.
  - `[data]` and `[dataSource]` are mutually exclusive.
  - Selection and function column outputs use Angular signal output APIs while retaining their template event names.
  - Local and remote data sources have distinct current contracts.
  - Canonical table state includes sort, filters, selected view, page index, page size, and aggregated columns.
  - Canonical URL writes use version 2 payloads; legacy compatibility paths still exist.
  - `tableHeight` defaults to `"parent"`, which can change layout when the parent does not provide suitable sizing.
  - Exact nonblank height values size the desktop table content viewport.
  - `tableHeight` does not affect the mobile renderer.
- Verified table documentation mismatches exist in `table.mdx`, including signal accessor examples, pagination initialization, Views claims, URL-state wording, remote filtering examples, and consumer import paths.
- `table.stories.ts` contains stale paginator configuration and an ambiguous exact-height sticky-column example.
- Other verified documentation defects include:
  - Invalid or inconsistent Angular application configuration examples.
  - Obsolete hydration keys.
  - Translation documentation referencing removed symbols.
  - Storage examples contradicting their own storage target.
  - HTTP documentation using an incorrect authentication header name and JWT configuration key.
  - Deprecated feature pages lacking accurate lifecycle warnings.
  - Broken Material Forms selectors, links, and Storybook hierarchy.
  - Invalid Data Export example bindings and transformation snippets.
- `README.md` currently contains only a link to hosted documentation and has no verified release claim requiring expansion.
- Planning inspection was static. Storybook, lint, and tests were not run while preparing this plan.

## 3. Assumptions / Open Questions

### Decisioni confermate

- Use tag `19.0.0` as the release comparison baseline.
- Keep all user-facing documentation in English.
- Review every maintained Storybook MDX page and `*.stories.ts` file, plus README files and attached consumer Markdown.
- Correct existing documentation that is not faithful to current code.
- Do not add documentation solely to cover public functionality that currently has no documentation.
- Keep the v20 “What’s New” concise and user-oriented.
- Include DEVK-693, DEVK-912, DEVK-1066, DEVK-1065, and DEVK-1046 in the v20 release narrative.
- Exclude DEVK-1000, DEVK-1001, DEVK-1002, DEVK-1078, DEVK-342, DEVK-1021, and DEVK-1105 from the v20 “What’s New” page.
- Limit the release breaking-change section to Kai Table input/output migration concerns and the confirmed Main Menu/Breadcrumbs deprecations.
- Explain that `tableHeight` is a new input whose default value is `"parent"` and may cause layout side effects if the parent sizing is unsuitable.
- Do not modify `CHANGELOG.md`.
- Do not modify operational library code, examples, tests, configuration, CI, or package dependencies.
- Validate with Storybook build/manual review, `npm run lint`, and `npm run test-ci`.

### Decisioni prese da me, con motivazione

- Treat current exported code as the primary source of truth, tag `19.0.0` as the migration baseline, and existing plans as supporting context. This prevents planned-but-unimplemented behavior from being presented as available.
- Update both `src/app/inobeta-ui/ui/kai-table/deprecation-guide.md` and `docs/DEVK-1066-kai-table-migration.md`. Both are consumer migration documents and currently duplicate claims that can drift.
- Exclude `docs/plans/` from documentation corrections. These are historical execution records, not consumer documentation.
- Exclude generated Compodoc output under `documentation/`. It is generated, gitignored, and not Storybook source.
- Leave `.storybook/`, `package.json`, `.gitlab-ci.yml`, and `CHANGELOG.md` untouched. Their configuration issues are outside the confirmed documentation-only scope.
- Remove or qualify claims when current behavior does not meet an earlier plan, rather than changing runtime behavior. This preserves the strict no-operational-code constraint.
- Do not describe Node.js 24.8+ as a package requirement because `package.json` has no matching `engines` declaration.
- Keep raw English prose in MDX and Markdown. These are documentation pages, not Angular runtime templates requiring ngx-translate keys.

### Questioni aperte, non bloccanti

- The current HEAD may gain more commits before execution. Each executor must inspect the execution-time code before finalizing factual statements, while preserving the confirmed ticket scope for the release page.
- Some inspected runtime behavior differs from historical requirements, including view-name validation, “Add view” snapshot behavior, page clamping, and mutable `tableName` edge cases. These do not block documentation work; documentation must describe current behavior without promising unavailable guarantees.
- The production `EISDIR` crash cannot be diagnosed from this Angular library repository. It belongs to the consuming Node.js application and is explicitly deferred to a future ticket.

## 4. Proposed Approach

Use a source-of-truth hierarchy:

1. Current public implementation and exports.
2. Diff from tag `19.0.0`.
3. Current unit tests when they define observable behavior.
4. Existing implementation plans as historical context only.
5. Existing documentation last, because it is the artifact being corrected.

The work is divided by documentation domain:

| Area | Outcome |
|---|---|
| Release documentation | Concise v20 introduction, highlights, migration warnings, and deprecations |
| Kai Table usage | Existing detailed guide corrected against current state, signals, data sources, Views, URL behavior, and sizing |
| Kai Table stories | Existing examples and controls corrected without adding unrelated demonstrations |
| Migration guides | Duplicate migration references aligned to one verified contract |
| Platform guides | Angular 20 setup, translation, hydration, and storage examples corrected |
| Deprecated modules | Lifecycle warnings and examples aligned with source deprecations |
| Remaining components | Full fidelity audit of existing stories and pages |
| Attached Markdown | Copy-paste examples and deprecation guidance corrected |

Each page must retain its current purpose. Executors must avoid editorial rewrites that do not fix correctness, navigation, or release clarity.

## 5. Step-by-Step Plan

### Dependencies between steps

`2 → 3 → 4`; `2+7+8 → 9`.

Steps 1, 5, 6, 7, and 8 are otherwise independent and may be executed in parallel.

---

### Step 1 — Rewrite the v20 What’s New page ✅ DONE [2026-08-04T15:26:42.747Z]

- **Executor**: `storybook-executor`
- **Modelli suggeriti**: gruppo F
- **File consentiti**: `src/whats_new.mdx`
- **Obiettivo**: Present the v20 release concisely, accurately, and with only the confirmed release subjects and breaking-change boundary.
- **Requisiti**:
  1. Rewrite the page in English as a user-oriented v20 release introduction.
  2. Cover DEVK-693, DEVK-912, DEVK-1066, DEVK-1065, and DEVK-1046.
  3. Explain Angular 20 compatibility without claiming an unsupported Node.js 24.8+ package requirement.
  4. Summarize the Kai Table refactoring, optional/restored Views, and `tableHeight`.
  5. Document only Kai Table input/output migration concerns as breaking changes, including required `tableName`, signal-based programmatic access, relevant output API changes, mutually exclusive `data`/`dataSource`, and the default `tableHeight="parent"` layout effect.
  6. State that Main Menu and Breadcrumbs are deprecated and planned for removal in v21.
  7. Exclude DEVK-1000, DEVK-1001, DEVK-1002, DEVK-1078, DEVK-342, DEVK-1021, and DEVK-1105.
  8. Keep the page concise; link or direct users to detailed Kai Table documentation rather than duplicating it.
- **Vincoli**: Do not modify `CHANGELOG.md`, add unsupported compatibility claims, label other changes as breaking, or change any non-Storybook file.
- **Validazione**: `npm run build-storybook` must complete successfully and include the rendered `What's new` docs page.
- **Stop condition**: Stop and report if an execution-time commit changes the confirmed v20 release subjects or breaking-change boundary.

**Executor Input**:

~~~
## TASK:
Rewrite the Storybook What's New page for the v20 release.

## CONTEXT:
The baseline is tag 19.0.0. The current file is src/whats_new.mdx and is an old draft that only covers DEVK-693. Current code must be the source of truth. The confirmed release subjects are DEVK-693, DEVK-912, DEVK-1066, DEVK-1065, and DEVK-1046. Detailed Kai Table behavior is documented under src/app/inobeta-ui/ui/kai-table/. package.json has no engines declaration supporting the current Node.js 24.8+ recommendation.

## OBJECTIVE:
Produce a concise English release page that accurately introduces v20 and its confirmed migration concerns.

## REQUIREMENTS:
1. Introduce version 20 in concise user-facing English.
2. Cover DEVK-693, DEVK-912, DEVK-1066, DEVK-1065, and DEVK-1046.
3. Describe Angular 20 compatibility without claiming Node.js 24.8+ is an enforced package requirement.
4. Summarize the Kai Table refactor, optional/restored Views, and tableHeight.
5. Limit breaking changes to Kai Table input/output migration concerns: required tableName, signal-based programmatic access, relevant output API changes, data/dataSource exclusivity, and tableHeight defaulting to "parent".
6. State that Main Menu and Breadcrumbs are deprecated and planned for removal in v21.
7. Do not mention DEVK-1000, DEVK-1001, DEVK-1002, DEVK-1078, DEVK-342, DEVK-1021, or DEVK-1105.
8. Keep details short and direct users to existing detailed documentation where useful.

## CONSTRAINTS:
- Modify only src/whats_new.mdx.
- Do not modify CHANGELOG.md.
- Do not invent compatibility requirements or release features.
- Do not classify data-source architecture or Views decoupling as additional breaking changes.
- Do not copy internal plan or feedback narratives into user-facing documentation.

## OUTPUT:
Report the final page structure, the included ticket subjects, the migration warnings, and the validation result.

## ACCEPTANCE CRITERIA:
- npm run build-storybook completes successfully.
- The rendered page identifies version 20 and all five included release subjects.
- The breaking-change section contains only the confirmed Kai Table input/output concerns and Main Menu/Breadcrumbs deprecations.
- None of the excluded ticket codes appears in src/whats_new.mdx.
- No unsupported Node.js 24.8+ requirement remains.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 2 — Correct the Kai Table usage guide ✅ DONE [2026-08-04T15:30:59.722Z]

- **Executor**: `storybook-executor`
- **Modelli suggeriti**: gruppo R
- **File consentiti**: `src/app/inobeta-ui/ui/kai-table/table.mdx`
- **Obiettivo**: Make the existing Kai Table Storybook guide accurately describe current v20 behavior and copyable APIs.
- **Requisiti**:
  1. Audit the complete page against current Kai Table, data-source, state, URL, Views, column, and sizing implementations.
  2. Replace consumer imports from `"public_api"` with the public package import `"@inobeta/ui"`.
  3. Correct signal-backed accessor examples to use current signal/model APIs rather than decorator-era property overrides.
  4. Distinguish canonical `tableDef.initialPageSize` initialization from paginator visual configuration.
  5. Correct existing Views claims, including view creation source, name validation guarantees, persisted fields, and optional integration.
  6. Correct URL-state content to include page index and aggregations, describe canonical v2 writes accurately, and describe mounted back/forward hydration without claiming component reinitialization.
  7. Correct remote data-source example generics and filter property names.
  8. Preserve the verified `tableHeight` contract: default parent mode, `400px` minimum content height, exact desktop content height, one scroll owner, and no mobile effect.
  9. Remove internal ticket language and any claim based only on historical plans.
  10. Do not add new sections solely for currently undocumented functionality.
- **Vincoli**: Do not modify TypeScript, templates, styles, examples, or tests. Do not conceal implementation limitations with aspirational wording.
- **Validazione**: `npm run build-storybook` must compile and render the Kai Table docs page without MDX errors.
- **Stop condition**: Stop and report if current source and tests define mutually incompatible public behavior that cannot be documented without choosing an unverified interpretation.

**Executor Input**:

~~~
## TASK:
Audit and correct the complete Kai Table Storybook MDX guide against current v20 code.

## CONTEXT:
Modify src/app/inobeta-ui/ui/kai-table/table.mdx. Read current Kai Table code, table-state resolver, URL codec/service, local and remote data sources, column models, table views host, and Views implementation as read-only references. Verified mismatches include "public_api" imports, decorator-era accessor overrides, paginator initialization, inaccurate Views guarantees, stale URL-state bullets, history.back() wording, and inconsistent remote filter examples.

## OBJECTIVE:
Make every existing Kai Table section factually accurate and every shown API snippet compatible with the current public contract.

## REQUIREMENTS:
1. Audit the entire MDX page against execution-time code.
2. Use "@inobeta/ui" in consumer import snippets.
3. Replace invalid accessor property overrides with current signal/model setup.
4. Document initialPageSize as canonical state initialization and paginator fields only according to their implemented role.
5. Correct Views creation, validation, persistence, and optional-host claims to match implementation.
6. State that canonical URL v2 state includes filters, selected view, page index, page size, aggregations, and sort; qualify legacy compatibility paths.
7. Describe mounted URL hydration/back-forward behavior without claiming table component reinitialization.
8. Make remote data-source types and filter property names internally consistent.
9. Keep tableHeight behavior aligned with current desktop implementation and its mobile exclusion.
10. Remove internal ticket references and avoid adding documentation only to fill feature coverage gaps.

## CONSTRAINTS:
- Modify only src/app/inobeta-ui/ui/kai-table/table.mdx.
- Treat current exported code as authoritative over historical plans.
- Do not modify runtime code to make an existing statement true.
- Do not promise view-name uniqueness, Add-from-current behavior, tableName immutability, or page clamping unless execution-time code enforces it.
- Do not add new Storybook stories in this step.

## OUTPUT:
Report corrected sections, implementation limitations reflected in prose, and Storybook build results.

## ACCEPTANCE CRITERIA:
- npm run build-storybook completes successfully.
- No consumer snippet imports from "public_api".
- Signal accessor examples use current model-signal APIs.
- Pagination, Views, URL v2, navigation, remote filtering, and tableHeight sections match current implementation.
- Internal DEVK implementation notes are absent from user-facing prose.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 3 — Align the Kai Table stories ✅ DONE [2026-08-04T15:33:24.856Z]

- **Executor**: `storybook-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/app/inobeta-ui/ui/kai-table/table.stories.ts`
- **Obiettivo**: Ensure every existing Kai Table story demonstrates valid current inputs, signal usage, pagination, and height behavior.
- **Requisiti**:
  1. Audit every existing story and its metadata against the current `IbTable` and column contracts.
  2. Replace stale paginator initialization with the canonical current configuration where the story intends to define initial page size.
  3. Keep `tableName` supplied and unique in every rendered table.
  4. Correct the exact-height sticky example so start and end sticky columns are unambiguous and do not carry conflicting flags.
  5. Ensure current accessor customization uses signal/model APIs.
  6. Align existing controls and descriptions with the inputs they claim to expose.
  7. Preserve existing story coverage and avoid adding new Views, local-source, or remote-source stories solely for completeness.
- **Vincoli**: Do not modify the Kai Table component, examples application, MDX, or tests. Do not add unrelated stories or visual redesign.
- **Validazione**: `npm run lint && npm run build-storybook` must pass.
- **Stop condition**: Stop and report if an existing story can only be made truthful through an operational component change.

**Executor Input**:

~~~
## TASK:
Correct the existing Kai Table Storybook stories against the current v20 component contract.

## CONTEXT:
Modify src/app/inobeta-ui/ui/kai-table/table.stories.ts. Use table.component.ts, current column classes, table-state types, and the corrected table.mdx as read-only references. Known issues include stale paginator page-size configuration and conflicting sticky/stickyEnd flags in the exact-height example.

## OBJECTIVE:
Make all existing Kai Table stories compile, render, and demonstrate only valid current APIs.

## REQUIREMENTS:
1. Audit all stories and metadata against current IbTable and column APIs.
2. Use canonical initial page-size configuration where a story intends to initialize table state.
3. Supply a unique required tableName to every rendered table.
4. Remove conflicting sticky flags and demonstrate distinct sticky-start and sticky-end columns.
5. Keep custom accessor setup compatible with current model signals.
6. Ensure controls and descriptions do not misstate the inputs they expose.
7. Preserve the existing story set without adding stories solely for undocumented feature coverage.

## CONSTRAINTS:
- Modify only src/app/inobeta-ui/ui/kai-table/table.stories.ts.
- Do not modify library implementation or example application files.
- Do not broaden the ticket into new story development.
- Do not weaken typing or introduce any.

## OUTPUT:
Report corrected stories, metadata changes, and lint/Storybook build results.

## ACCEPTANCE CRITERIA:
- npm run lint passes.
- npm run build-storybook passes.
- Every rendered table supplies tableName.
- Initial page-size examples use the current canonical contract.
- The exact-height story has separate, non-conflicting sticky-start and sticky-end columns.
- Existing accessor examples compile with current signal APIs.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 4 — Synchronize Kai Table migration guides ✅ DONE [2026-08-04T15:36:39.500Z]

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/app/inobeta-ui/ui/kai-table/deprecation-guide.md`, `docs/DEVK-1066-kai-table-migration.md`
- **Obiettivo**: Keep both Kai Table migration references consistent with each other, the corrected Storybook guide, and the actual v20 public contract.
- **Requisiti**:
  1. Audit both guides against tag `19.0.0` and current exported code.
  2. Remove false historical claims such as describing `initialSort` as a standalone table input or presenting `items` as the v19 Kai Table contract.
  3. Document the verified table input/output migration surfaces without inventing table-level outputs.
  4. Cover required `tableName`, signal programmatic access, output API type changes, `data`/`dataSource` exclusivity, and `tableHeight="parent"` side effects.
  5. Keep current local/remote data-source and state migration examples accurate without broadening the release breaking-change classification.
  6. Qualify v2 URL emission as the canonical writer behavior because deprecated compatibility writers remain.
  7. Use `"@inobeta/ui"` in consumer snippets.
  8. Keep deprecated public compatibility APIs clearly identified where already in scope.
  9. Ensure both documents describe the same migration path and terminology.
- **Vincoli**: Do not edit historical plans under `docs/plans/`, runtime code, or `CHANGELOG.md`. Do not claim implementation guarantees absent from current code.
- **Validazione**: `git diff --check -- src/app/inobeta-ui/ui/kai-table/deprecation-guide.md docs/DEVK-1066-kai-table-migration.md` must produce no errors.
- **Stop condition**: Stop and report if tag `19.0.0` is unavailable or the current public API cannot be reconciled with the migration baseline.

**Executor Input**:

~~~
## TASK:
Synchronize the two Kai Table migration Markdown guides with the 19.0.0-to-v20 public API delta.

## CONTEXT:
Modify src/app/inobeta-ui/ui/kai-table/deprecation-guide.md and docs/DEVK-1066-kai-table-migration.md. Tag 19.0.0 is the baseline. Read current public_api.ts, Kai Table barrels, table component, columns, data sources, state, and URL service as read-only references. The corrected table.mdx defines the detailed Storybook wording.

## OBJECTIVE:
Provide one consistent and factually verified migration story across both Markdown guides.

## REQUIREMENTS:
1. Compare statements against tag 19.0.0 and current exported code.
2. Remove false claims about standalone initialization inputs and obsolete "items" migration.
3. Document only verified table input/output migration surfaces and do not invent a table-level row-click output.
4. Cover required tableName, signal invocation, changed programmatic output types, data/dataSource exclusivity, and default tableHeight parent mode.
5. Keep current data-source and canonical state examples accurate without labeling extra architecture work as a release breaking change.
6. Say that the canonical URL writer emits v2 while deprecated compatibility writers may still use legacy payloads.
7. Replace "public_api" consumer imports with "@inobeta/ui".
8. Identify deprecated public compatibility APIs accurately where the guides already discuss them.
9. Keep both documents consistent in names, examples, and migration order.

## CONSTRAINTS:
- Modify only the two allowed Markdown files.
- Do not edit docs/plans, CHANGELOG.md, or runtime files.
- Do not document planned behavior as implemented behavior.
- Do not broaden the confirmed What's New breaking-change section.

## OUTPUT:
Report reconciled migration sections, removed inaccurate claims, and validation results.

## ACCEPTANCE CRITERIA:
- git diff --check reports no errors for both files.
- Both guides use the same current API names and migration order.
- No consumer snippet imports from "public_api".
- Neither guide claims all public writer paths emit v2.
- Required tableName, signal access, output changes, data/dataSource exclusivity, and tableHeight default behavior are documented accurately.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 5 — Correct platform and state guides ✅ DONE [2026-08-04T15:39:50.229Z]

- **Executor**: `storybook-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/getting_started.mdx`, `src/app/inobeta-ui/hydration/hydration.mdx`, `src/app/inobeta-ui/storage/storage.mdx`, `src/app/inobeta-ui/translate/translate.mdx`, `src/app/inobeta-ui/translate/how_to_translate.mdx`
- **Obiettivo**: Make installation, application configuration, translation, hydration, and storage guidance valid for the current Angular 20 library.
- **Requisiti**:
  1. Audit all five pages against current modules, providers, exports, translation assets, hydration keys, and storage APIs.
  2. Correct Angular `ApplicationConfig` and translation provider examples so they are syntactically valid and internally consistent.
  3. Remove obsolete instructions that mix `app.module.ts` setup with standalone `ApplicationConfig` examples.
  4. Replace removed translation symbols and include current symbols only where existing documentation already inventories them.
  5. Remove obsolete `ibViews` hydration advice and use the current table-state feature name only where supported.
  6. Explain that current Views persistence is dedicated per-table local storage rather than hydrated `ibViews` state.
  7. Correct the storage example so its write and read targets agree.
  8. Add deprecation context to Getting Started references that still direct users toward deprecated modules.
- **Vincoli**: Do not modify translation JSON, providers, modules, storage implementation, or hydration implementation. Do not add documentation for previously undocumented features.
- **Validazione**: `npm run build-storybook` must pass and render all five pages.
- **Stop condition**: Stop and report if a setup snippet cannot be verified from current public exports and bootstrap configuration.

**Executor Input**:

~~~
## TASK:
Correct the current platform, translation, hydration, and storage Storybook guides.

## CONTEXT:
Modify the five allowed MDX files. Read app.config.ts, public_api.ts, translate loaders/exports, hydration implementation, storage services, and current feature-state names as read-only references. Known defects include malformed provider arrays, AppModule/ApplicationConfig mixing, removed translation symbols, obsolete ibViews hydration, and a local-storage/cookie contradiction.

## OBJECTIVE:
Make all existing setup and state-persistence instructions valid for the current Angular 20 codebase.

## REQUIREMENTS:
1. Audit all five pages against current exported APIs.
2. Provide syntactically valid and internally consistent ApplicationConfig/translation examples.
3. Remove contradictory AppModule instructions from standalone configuration sections.
4. Replace removed translation symbols only within existing translation inventory content.
5. Remove ibViews hydration guidance and describe current dedicated per-table Views storage accurately.
6. Use the current Kai Table state feature name only when current code supports the recommendation.
7. Make storage write/read examples use the same storage target.
8. Warn when Getting Started still references a deprecated module.

## CONSTRAINTS:
- Modify only the allowed MDX files.
- Do not change runtime providers, translations, state, or storage code.
- Do not invent setup APIs.
- Keep all prose in English.
- Do not expand documentation into new feature tutorials.

## OUTPUT:
Report corrected setup snippets, removed obsolete state guidance, and Storybook build results.

## ACCEPTANCE CRITERIA:
- npm run build-storybook completes successfully.
- ApplicationConfig examples are structurally valid.
- No page recommends hydrating ibViews.
- Removed translation symbols are absent from active guidance.
- Storage examples read from the same target to which they write.
- Deprecated modules are not presented as unqualified recommendations.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 6 — Align HTTP documentation and stories ✅ DONE [2026-08-04T15:42:58.970Z]

- **Executor**: `storybook-executor`
- **Modelli suggeriti**: gruppo C
- **File consentiti**: `src/app/inobeta-ui/http/http.mdx`, `src/app/inobeta-ui/http/http-api.mdx`, `src/app/inobeta-ui/http/auth/login.service.mdx`, `src/app/inobeta-ui/http/auth/login.stories.ts`, `src/app/inobeta-ui/http/http/loading-skeleton.stories.ts`
- **Obiettivo**: Ensure the existing HTTP, authentication, login, and loading-skeleton documentation matches current APIs and deprecation status.
- **Requisiti**:
  1. Audit all existing HTTP pages and stories against current exported HTTP modules, services, directives, guards, interceptors, tokens, and components.
  2. Display source-backed deprecation and removal information prominently without adding these APIs to the v20 release page.
  3. Correct the documented authentication header from `Authentication` to `Authorization`.
  4. Correct the JWT roles-field provider example so it uses the actual roles-field token rather than the claims-field token.
  5. Verify every login story input/output and every loading-skeleton story variant against current code.
  6. Preserve existing story scope; do not add new skeleton stories solely because a type exists.
  7. Keep Storybook titles and links internally consistent.
- **Vincoli**: Do not modify HTTP runtime code, auth behavior, translation assets, or `src/whats_new.mdx`.
- **Validazione**: `npm run lint && npm run build-storybook` must pass.
- **Stop condition**: Stop and report if source deprecation metadata conflicts across the module, service, and public exports.

**Executor Input**:

~~~
## TASK:
Correct all existing HTTP-related Storybook documentation and stories.

## CONTEXT:
Modify the allowed HTTP MDX and stories files. Read current HTTP/auth modules, services, guards, interceptors, directives, tokens, components, and public exports as read-only references. Known defects include an Authentication/Authorization mismatch, a roles-field example using the claims-field token, and deprecated APIs presented without lifecycle context.

## OBJECTIVE:
Make existing HTTP documentation factually accurate, internally linked, and explicit about current deprecation status.

## REQUIREMENTS:
1. Audit every allowed page and story against current source.
2. Add source-backed deprecation/removal warnings where required.
3. Document the Authorization header name correctly.
4. Use the actual JWT roles-field provider token in the roles configuration example.
5. Verify login story inputs/outputs and loading-skeleton variants against current APIs.
6. Preserve existing coverage without adding stories solely for undocumented variants.
7. Keep titles, links, snippets, and terminology consistent.

## CONSTRAINTS:
- Modify only the allowed Storybook files.
- Do not modify HTTP or auth runtime behavior.
- Do not add HTTP deprecations to src/whats_new.mdx.
- Do not invent replacement APIs if source does not define them.
- Keep all documentation in English.

## OUTPUT:
Report corrected API claims, deprecation notices, story changes, and validation results.

## ACCEPTANCE CRITERIA:
- npm run lint passes.
- npm run build-storybook passes.
- Active guidance uses Authorization, not Authentication, for the auth header.
- The JWT roles example uses the roles-field token.
- Every documented deprecation matches source metadata.
- Existing login and skeleton stories compile against current inputs and outputs.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 7 — Correct deprecated UI feature documentation ✅ DONE [2026-08-04T15:46:41.086Z]

- **Executor**: `storybook-executor`
- **Modelli suggeriti**: gruppo F
- **File consentiti**: `src/app/inobeta-ui/ui/breadcrumb/breadcrumb.mdx`, `src/app/inobeta-ui/ui/breadcrumb/breadcrumb.stories.ts`, `src/app/inobeta-ui/ui/main-menu/main-menu.module.mdx`, `src/app/inobeta-ui/ui/material-forms/material-form.mdx`, `src/app/inobeta-ui/ui/material-forms/material-form.stories.ts`, `src/app/inobeta-ui/ui/material-forms/controls/controls.mdx`
- **Obiettivo**: Make deprecated navigation and Material Forms documentation explicit, navigable, and compatible with current selectors and APIs.
- **Requisiti**:
  1. Audit all allowed pages and stories against current source deprecation metadata and selectors.
  2. State the confirmed v21 removal plan for Main Menu and Breadcrumbs.
  3. Preserve Material Forms deprecation wording according to its own source metadata without inferring the same removal version.
  4. Fix inconsistent Storybook titles and navigation links.
  5. Replace nonexistent plural Material Forms selectors with the current selector.
  6. Remove malformed Markdown residue and stale example branding where it reduces copy accuracy.
  7. Keep deprecated documentation available; do not delete the pages or present them as recommended for new work.
- **Vincoli**: Do not modify component modules, selectors, templates, styles, or replacement components.
- **Validazione**: `npm run lint && npm run build-storybook` must pass with one consistent sidebar location per documented feature.
- **Stop condition**: Stop and report if source metadata does not establish whether a deprecation or removal version is public.

**Executor Input**:

~~~
## TASK:
Correct deprecated Breadcrumb, Main Menu, and Material Forms Storybook documentation.

## CONTEXT:
Modify only the allowed MDX and stories files. Read current module/component deprecation JSDoc and selectors as read-only references. Main Menu and Breadcrumbs have confirmed v21 removal notices. Material Forms must follow its own source metadata. Known defects include inconsistent sidebar spacing, stale links, nonexistent plural selectors, and malformed Markdown residue.

## OBJECTIVE:
Keep deprecated pages useful for existing consumers while clearly preventing them from being mistaken for recommended new APIs.

## REQUIREMENTS:
1. Audit every allowed page and story against current source metadata and selectors.
2. State v21 removal for Main Menu and Breadcrumbs.
3. Describe Material Forms deprecation only as strongly as its source metadata supports.
4. Normalize Storybook titles and internal links.
5. Replace invalid plural Material Forms selectors with the current selector.
6. Remove malformed Markdown residue and misleading stale example text.
7. Retain all existing pages and examples unless a snippet is invalid.

## CONSTRAINTS:
- Modify only the allowed Storybook files.
- Do not change runtime selectors or components.
- Do not invent replacement APIs or removal versions.
- Do not remove deprecated documentation entirely.
- Keep prose in English.

## OUTPUT:
Report corrected warnings, selectors, navigation paths, and validation results.

## ACCEPTANCE CRITERIA:
- npm run lint passes.
- npm run build-storybook passes.
- Breadcrumb and Main Menu pages explicitly state planned v21 removal.
- Material Forms wording matches its source deprecation metadata.
- No active snippet uses a nonexistent plural Material Forms selector.
- Storybook titles no longer create duplicate groups through whitespace differences.
- Internal docs links resolve to existing Storybook titles.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 8 — Audit remaining component pages and stories ✅ DONE [2026-08-04T15:50:11.578Z]

- **Executor**: `storybook-executor`
- **Modelli suggeriti**: gruppo F
- **File consentiti**: `src/app/inobeta-ui/ui/forms-utilities/forms.mdx`, `src/app/inobeta-ui/ui/forms-utilities/form.stories.ts`, `src/app/inobeta-ui/ui/kai-filter/filters.mdx`, `src/app/inobeta-ui/ui/kai-filter/filter.stories.ts`, `src/app/inobeta-ui/ui/modal/modal.mdx`, `src/app/inobeta-ui/ui/modal/modal.stories.ts`, `src/app/inobeta-ui/ui/toast/toast.mdx`, `src/app/inobeta-ui/ui/toast/toast.stories.ts`
- **Obiettivo**: Complete the general Storybook fidelity review for current forms utilities, filters, modal, and toast documentation.
- **Requisiti**:
  1. Audit every existing page, story, code snippet, arg type, control, event, selector, and public import against current source.
  2. Correct only factual, API, navigation, or rendering mismatches.
  3. Preserve existing examples that remain valid.
  4. Do not add stories or sections solely to document currently uncovered functionality.
  5. Keep user-visible prose in English and maintain existing Storybook organization unless it is broken.
  6. Leave a file unchanged when its current content is already faithful.
- **Vincoli**: Do not modify runtime feature files, examples, translations, tests, or Storybook configuration.
- **Validazione**: `npm run lint && npm run build-storybook` must pass and render every audited docs entry.
- **Stop condition**: Stop and report if a page requires a runtime change to make its documented behavior true.

**Executor Input**:

~~~
## TASK:
Audit and correct the remaining current component Storybook pages and stories.

## CONTEXT:
The allowed files cover Forms Utilities, Kai Filter, Modal, and Toast. Read each feature's current public exports, module, component/service APIs, selectors, inputs, outputs, and tests as read-only references. This step is a fidelity audit, not a request to expand documentation coverage.

## OBJECTIVE:
Ensure every existing allowed page and story accurately represents current code.

## REQUIREMENTS:
1. Check every page, story, snippet, argType, control, event, selector, and import against current source.
2. Correct factual, API, navigation, and rendering mismatches only.
3. Preserve examples that remain valid.
4. Do not add documentation solely for currently undocumented features.
5. Keep prose in English and retain valid Storybook organization.
6. Leave accurate files unchanged and report that they were reviewed.

## CONSTRAINTS:
- Modify only the allowed MDX and stories files.
- Do not change runtime code, tests, translations, examples, or .storybook configuration.
- Do not perform editorial rewrites without a correctness reason.
- Do not introduce any or weaken story typing.

## OUTPUT:
List every audited file, identify changed versus unchanged files, summarize corrected mismatches, and report validation results.

## ACCEPTANCE CRITERIA:
- npm run lint passes.
- npm run build-storybook passes.
- Every allowed file is explicitly reported as reviewed.
- All existing snippets use current public imports, selectors, inputs, and outputs.
- No new story or section exists solely to increase feature coverage.
- All Storybook entries render without duplicate or broken navigation caused by their metadata.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

### Step 9 — Correct attached consumer Markdown ✅ DONE [2026-08-04T15:53:09.083Z]

- **Executor**: `task-executor`
- **Modelli suggeriti**: gruppo F
- **File consentiti**: `README.md`, `src/app/inobeta-ui/ui/data-export/data-export.module.md`, `src/app/inobeta-ui/ui/forms/forms.module.md`
- **Obiettivo**: Correct attached non-MDX consumer documentation while preserving the README’s intentionally minimal role.
- **Requisiti**:
  1. Verify the README documentation link and leave the file minimal unless a factual correction is required.
  2. Correct the Data Export table example to use current Kai Table inputs and projected column definitions.
  3. Correct the Data Export transformation example so its description, variables, types, and returned value agree.
  4. Audit Data Export terminology against current local/remote export capabilities.
  5. Add or correct deprecation context in the legacy Forms module Markdown according to current source metadata.
  6. Align shared Kai Table and Forms terminology with the corrected Storybook pages.
  7. Do not add release notes to README or duplicate the “What’s New” page.
- **Vincoli**: Do not modify runtime code, `CHANGELOG.md`, generated Compodoc output, or internal plans.
- **Validazione**: `git diff --check -- README.md src/app/inobeta-ui/ui/data-export/data-export.module.md src/app/inobeta-ui/ui/forms/forms.module.md` must produce no errors.
- **Stop condition**: Stop and report if the hosted documentation URL cannot be verified and changing it would require guessing a deployment destination.

**Executor Input**:

~~~
## TASK:
Correct the maintained README and attached consumer Markdown files.

## CONTEXT:
Modify README.md, the Data Export module Markdown, and the legacy Forms module Markdown. Use current Kai Table, Data Export, Forms, public exports, and corrected Storybook docs as read-only references. Known Data Export defects include a nonexistent [columns] table input and a transformation snippet that describes booleans but returns an undefined date value.

## OBJECTIVE:
Make attached Markdown copy-paste examples and lifecycle guidance accurate without expanding README into a release document.

## REQUIREMENTS:
1. Verify the README docs link and preserve its minimal role when the link remains correct.
2. Replace invalid Data Export table bindings with current Kai Table inputs and projected columns.
3. Make the transformation example's prose, variables, types, and returned value consistent.
4. Describe local/remote export capabilities only as current code supports them.
5. Add source-backed deprecation context to the legacy Forms module guide.
6. Use terminology consistent with corrected Kai Table and Forms Storybook pages.
7. Do not duplicate v20 release notes in README.

## CONSTRAINTS:
- Modify only the three allowed Markdown files.
- Do not edit CHANGELOG.md, docs/plans, generated documentation, or runtime files.
- Do not invent a new hosted documentation URL.
- Do not add new tutorials beyond correcting existing material.

## OUTPUT:
Report each reviewed file, factual corrections, unchanged content, and validation results.

## ACCEPTANCE CRITERIA:
- git diff --check reports no errors for all three files.
- Data Export examples use current Kai Table bindings and valid projected columns.
- Transformation examples have matching prose and executable variable references.
- Legacy Forms deprecation wording matches current source metadata.
- README remains concise and does not duplicate the v20 What's New page.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

---

## 6. Impacted Areas

### Release documentation

- `src/whats_new.mdx`
  - Rewritten v20 presentation.
  - Confirmed release highlights and migration warnings.
  - Main Menu/Breadcrumbs deprecation notice.

### Kai Table documentation

- `src/app/inobeta-ui/ui/kai-table/table.mdx`
- `src/app/inobeta-ui/ui/kai-table/table.stories.ts`
- `src/app/inobeta-ui/ui/kai-table/deprecation-guide.md`
- `docs/DEVK-1066-kai-table-migration.md`

These files will describe existing public symbols and behavior more accurately. No public symbol will be added, removed, renamed, or changed.

### Platform documentation

- `src/getting_started.mdx`
- `src/app/inobeta-ui/hydration/hydration.mdx`
- `src/app/inobeta-ui/storage/storage.mdx`
- `src/app/inobeta-ui/translate/translate.mdx`
- `src/app/inobeta-ui/translate/how_to_translate.mdx`

### HTTP documentation

- `src/app/inobeta-ui/http/http.mdx`
- `src/app/inobeta-ui/http/http-api.mdx`
- `src/app/inobeta-ui/http/auth/login.service.mdx`
- `src/app/inobeta-ui/http/auth/login.stories.ts`
- `src/app/inobeta-ui/http/http/loading-skeleton.stories.ts`

### UI component documentation

- `src/app/inobeta-ui/ui/breadcrumb/breadcrumb.mdx`
- `src/app/inobeta-ui/ui/breadcrumb/breadcrumb.stories.ts`
- `src/app/inobeta-ui/ui/main-menu/main-menu.module.mdx`
- `src/app/inobeta-ui/ui/material-forms/material-form.mdx`
- `src/app/inobeta-ui/ui/material-forms/material-form.stories.ts`
- `src/app/inobeta-ui/ui/material-forms/controls/controls.mdx`
- `src/app/inobeta-ui/ui/forms-utilities/forms.mdx`
- `src/app/inobeta-ui/ui/forms-utilities/form.stories.ts`
- `src/app/inobeta-ui/ui/kai-filter/filters.mdx`
- `src/app/inobeta-ui/ui/kai-filter/filter.stories.ts`
- `src/app/inobeta-ui/ui/modal/modal.mdx`
- `src/app/inobeta-ui/ui/modal/modal.stories.ts`
- `src/app/inobeta-ui/ui/toast/toast.mdx`
- `src/app/inobeta-ui/ui/toast/toast.stories.ts`

### Attached Markdown

- `README.md`
- `src/app/inobeta-ui/ui/data-export/data-export.module.md`
- `src/app/inobeta-ui/ui/forms/forms.module.md`

### Deliberately untouched

- All runtime files under `src/app/inobeta-ui/` other than `*.stories.ts`.
- All example application files under `src/app/examples/`.
- `public_api.ts`.
- `CHANGELOG.md`.
- `.storybook/`.
- `package.json` and lock files.
- `.gitlab-ci.yml`.
- Tests and translation JSON.
- Generated `documentation/`.
- Historical plans under `docs/plans/`.

## 7. Risks

- **Documentation may reproduce planned rather than implemented behavior.** Mitigation: use current code and exports as primary sources; use plans only for context.
- **The broad review may create unnecessary editorial churn.** Mitigation: each step must change only factual, API, navigation, lifecycle, or rendering mismatches.
- **The branch may change after planning.** Mitigation: verify execution-time HEAD against tag `19.0.0` before finalizing release claims.
- **Storybook build validates MDX structure but not every code snippet semantically.** Mitigation: manually compare snippets with exported types and current examples, then perform rendered-page review.
- **Correct documentation may expose runtime limitations that earlier plans intended to solve.** Mitigation: document current behavior or remove unsupported guarantees; log runtime defects for future tickets without changing code.
- **Deprecated APIs may be mistaken for recommended APIs if their pages remain extensive.** Mitigation: place visible source-backed lifecycle warnings while retaining migration value.
- **The confirmed breaking-change scope may omit other technically breaking internals.** Mitigation: keep the release page within the user-confirmed boundary; detailed guides may explain current APIs without reclassifying unrelated work as a release breaking change.
- **The production `EISDIR` crash remains unresolved.** Accepted risk: it originates in a consuming Node.js server unavailable in this repository and is deferred to a separate ticket.
- **README’s hosted documentation link may be unavailable during execution.** Mitigation: do not invent a replacement destination; report an unverifiable link instead.

## 8. Validation Checklist

- [ ] `npm run lint` completes without errors.
- [ ] `npm run test-ci` completes without failures and maintains configured coverage thresholds.
- [ ] `npm run build-storybook` completes successfully.
- [ ] `git diff --check` reports no whitespace errors.
- [ ] `npm run storybook` starts Storybook on port 6006 for manual review.
- [ ] The `What's new` page renders and presents v20 concisely.
- [ ] DEVK-693, DEVK-912, DEVK-1066, DEVK-1065, and DEVK-1046 are represented accurately.
- [ ] DEVK-1000, DEVK-1001, DEVK-1002, DEVK-1078, DEVK-342, DEVK-1021, and DEVK-1105 do not appear in `src/whats_new.mdx`.
- [ ] The release breaking-change section contains only confirmed Kai Table input/output migration concerns and Main Menu/Breadcrumbs deprecations.
- [ ] `tableHeight="parent"` is identified as the default and its parent-sizing side effect is explained.
- [ ] No documentation claims Node.js 24.8+ is an enforced package requirement.
- [ ] Every Storybook sidebar entry opens without MDX rendering errors.
- [ ] Internal Storybook links resolve to an existing page.
- [ ] All copyable imports use public package paths rather than `"public_api"`.
- [ ] Kai Table snippets use current signal/model APIs.
- [ ] Kai Table pagination, Views, URL state, local/remote sources, and height descriptions match current code.
- [ ] Deprecated pages visibly state source-backed lifecycle information.
- [ ] No documentation promises behavior absent from current implementation.
- [ ] README and attached Markdown examples are factually consistent.
- [ ] `git diff --name-only` contains only the files permitted by this plan.
- [ ] `CHANGELOG.md`, operational library code, examples, tests, configuration, CI, generated docs, and internal plans remain unchanged.
