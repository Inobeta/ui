# DEVK-1046 — Altezza container per Kai Table — Post-implementation feedback

## References

- Original plan: `devk-1046-altezza-container-per-kai-table`.
- Branch reviewed: `fix/DEVK-1046-table-height` vs `develop/20.0.0`.
- Review date: `2026-08-03`.

## Verdict

**PASS**

Four completed steps reviewed: 0 BLOCKER, 5 WARNING, and 0 NIT findings. All four declared validation commands completed successfully; remediation is recommended for the responsive demo, test completeness, documentation contradiction, and unrelated branch changes.

## Reviewed steps

### Step 1 — Implementare il contratto desktop `tableHeight`

- **Original plan state**: `[DONE]`
- **Acceptance criteria**: 11 / 11 met.
- **Verification commands**: `npm run packagr` — 1 package entry point built / 0 errors.
- **Expected files**:
  - `src/app/inobeta-ui/ui/kai-table/table.component.ts`
  - `src/app/inobeta-ui/ui/kai-table/table.component.html`
  - `src/app/inobeta-ui/ui/kai-table/table.component.scss`
- **Files actually changed**:
  - `src/app/inobeta-ui/ui/kai-table/table.component.ts`
  - `src/app/inobeta-ui/ui/kai-table/table.component.html`
  - `src/app/inobeta-ui/ui/kai-table/table.component.scss`
- **Issues found**: none.
- **Notes**: The input normalization, parent/exact modes, flex chain, `400px` fallback, single production scroll owner, obsolete-variable removal, sticky declarations, paginator visibility, and mobile exclusion are present.

### Step 2 — Coprire altezza, fallback e scroll con Jasmine

- **Original plan state**: `[DONE]`
- **Acceptance criteria**: 8 / 9 met.
- **Verification commands**: `npx ng test --include='src/app/inobeta-ui/ui/kai-table/table.component.spec.ts' --watch=false` — 62 pass / 0 fail / 0 skipped.
- **Expected files**:
  - `src/app/inobeta-ui/ui/kai-table/table.component.spec.ts`
- **Files actually changed**:
  - `src/app/inobeta-ui/ui/kai-table/table.component.spec.ts`
- **Issues found**:
  - `[WARNING]` The single-scroll test examines only five manually selected elements instead of all table-owned structural descendants (`src/app/inobeta-ui/ui/kai-table/table.component.spec.ts:1179-1199`). Impact: a future nested wrapper or projected structural element could acquire `overflow: auto` without failing this regression test, so the declared invariant is only partially guarded. Recommendation: enumerate the host and relevant descendants, excluding overlays outside the fixture, and assert that `.ib-table__content` is the sole scrollable result.
- **Notes**: Omitted, empty, whitespace, exact `500px`, fallback `400px`, override `420px`, parent fill, sibling placement, sticky header/column, and sticky aggregation footer are covered. No focused or disabled Jasmine declarations were found.

### Step 3 — Aggiornare gli esempi desktop rappresentativi

- **Original plan state**: `[DONE]`
- **Acceptance criteria**: 6 / 6 original plan criteria met.
- **Verification commands**: `npm run build` — 4 initial chunks / 1 lazy chunk / 0 errors.
- **Expected files**:
  - `src/app/examples/kai-table-example/kai-table-example.html`
  - `src/app/examples/kai-table-example/kai-table-example.scss`
  - `src/app/examples/kai-table-example/kai-table-sticky-example.ts`
- **Files actually changed**:
  - `src/app/examples/kai-table-example/kai-table-example.html`
  - `src/app/examples/kai-table-example/kai-table-example.scss`
  - `src/app/examples/kai-table-example/kai-table-sticky-example.ts`
- **Issues found**:
  - `[WARNING]` Outside the original acceptance criteria but required by the review context: no application example demonstrates `"parent"` mode dynamically occupying the viewport remainder below menu and breadcrumbs. The simple example terminates the height chain at a fixed `500px` wrapper (`src/app/examples/kai-table-example/kai-table-example.html:4-12`, `src/app/examples/kai-table-example/kai-table-example.scss:3-12`), while the sticky example explicitly uses exact `500px` mode (`src/app/examples/kai-table-example/kai-table-sticky-example.ts:10-28`). The demo shell itself has an auto-height flex container and no growing/min-height-zero route area (`src/app/examples/nav/nav.component.html:2-7`, `src/app/examples/nav/nav.component.css:1-18`). Impact: the examples do not prove the intended real-page layout and can produce a browser scrollbar instead of giving the remaining height to the table. Recommendation: establish a full-height flex shell and make at least the simple example’s table wrapper consume the remaining routed-page height; retain one exact-height example for the other API mode.
- **Notes**: The original Step 3 requirements are met: basic uses parent mode inside a definite wrapper, sticky uses exact height, and the previous sticky outer `overflow-x: auto` was removed.

### Step 4 — Documentare API e migrazione consumer

- **Original plan state**: `[DONE]`
- **Acceptance criteria**: 10 / 11 met.
- **Verification commands**: `npm run build-storybook` — manager and preview built / 0 build errors; static output generated under `dist/storybook/ui`.
- **Expected files**:
  - `src/app/inobeta-ui/ui/kai-table/table.stories.ts`
  - `src/app/inobeta-ui/ui/kai-table/table.mdx`
- **Files actually changed**:
  - `src/app/inobeta-ui/ui/kai-table/table.stories.ts`
  - `src/app/inobeta-ui/ui/kai-table/table.mdx`
- **Issues found**:
  - `[WARNING]` The documentation first says parent-mode content takes the remaining space after toolbar, filter, and paginator, but later states that these elements do not reduce the content viewport “in both modes” (`src/app/inobeta-ui/ui/kai-table/table.mdx:772-777,808-810`). Impact: consumers can misread parent mode as preserving a fixed content viewport, contradicting the implemented residual flex sizing. Recommendation: distinguish the modes explicitly: siblings reduce available content space in parent mode, while they add to total component height in exact mode.
- **Notes**: Storybook controls, parent/exact stories, sticky start/end coverage, breaking-change notice, CSS fallback, removed variables, migration checklist, external consumers, and mobile exclusion are documented.

## Files outside the plan scope

- `[WARNING]` A machine-generated runner ignore file was added outside every reviewed step’s allowed files (`.agents-runner/.gitignore:1-11`). Impact: unrelated repository tooling becomes part of DEVK-1046 and complicates review ownership. Recommendation: remove it from this ticket’s diff or move it to a dedicated tooling change.
- `[WARNING]` Unrelated plans and feedback documents were changed only to append completion markers (`docs/plans/DEVK-1000-table-def-paginator-bug.md:124`, `docs/plans/DEVK-1002-mobile-empty-table.md:80,171,263`, `docs/plans/DEVK-1045-kai-table-examples.md:104,178,243,308,379,457,465,526`, `docs/plans/DEVK-1065-restore-table-views.md:224,311,414,516,599,668,743,812,877`, `docs/plans/DEVK-1066-kai-table-refactoring-feedback.md:82,121,159,199,236,276,316,354,394,433,471,509,547,584`, `docs/plans/DEVK-1066-kai-table-refactoring.md:249-1614`, `docs/plans/DEVK-1066-step-12-1-remote-cutover.md:135`, `docs/plans/DEVK-912-decouple-table-views-feedback.md:106,145`, `docs/plans/DEVK-912-decouple-table-views.md:86-622`). Impact: DEVK-1046 carries unrelated historical state changes and increases merge-conflict risk. Recommendation: revert these files from this branch or submit their state updates separately.

The newly added DEVK-1046 original plan is treated as the review source, not as an implementation-scope violation.

## Scope Check

The implementation files assigned to Steps 1–4 stayed within their respective executor boundaries. Branch-level exceptions are limited to the unrelated runner and plan-state files listed above. No mobile component, public API barrel, NgRx slice, data source, routing configuration, or Storybook configuration was changed.

## Convention Violations

None found in the reviewed implementation. The Angular templates keep the new height logic in typed signals/computed values, introduce no casts or complex template expressions, and add no application-visible untranslated text.

## Missing Validation

None. Every validation command declared by the four reviewed steps was run during this review. All completed with exit code 0.

The responsive viewport-remainder behavior requested during review is not covered by a declared automated command and is currently absent from the demo layout, as recorded under Step 3.

## Remediation plan

### Remediation 1 — Demonstrate responsive parent height [agent: examples-executor] [model: `opencode/gpt-5.6-luna`] ✅ DONE

~~~
## TASK:
Make at least the simple Kai Table example dynamically fill the routed viewport space below the menu and breadcrumbs.

## CONTEXT:
The simple example currently uses a fixed 500px wrapper in `src/app/examples/kai-table-example/kai-table-example.scss:10-12`. The demo shell in `src/app/examples/nav/nav.component.html:2-7` has no definite viewport height or flex-growing route area. Consequently, parent mode fills 500px rather than the available page remainder.

## OBJECTIVE:
Provide a real application example where the menu/breadcrumb row keeps its natural height and a parent-mode Kai Table consumes the remaining viewport height with `.ib-table__content` as the only scroll owner.

## REQUIREMENTS:
1. Establish a full-height column flex chain in the demo navigation shell, including `min-height: 0` for the routed-content area.
2. Convert the simple example host and `.table-wrapper` to flex sizing so the wrapper consumes the remaining space after its local controls.
3. Keep the simple table in parent mode.
4. Retain at least one representative exact-height example, including the current sticky start/end behavior.
5. Confirm that the normal desktop viewport has no table-surrounding browser or wrapper scrollbar.
6. Add no visible labels or translation keys.

## CONSTRAINTS:
- Modify only files under `src/app/examples/`.
- Do not modify library source, mobile examples, datasets, routes, or table behavior.
- Do not restore external `overflow: auto` around Kai Table.
- Preserve the exact-height demonstration required by the original plan.

## OUTPUT:
Report the shell/example files changed, which example demonstrates each height mode, and the validation command run.

## ACCEPTANCE CRITERIA:
- `npm run build` completes with 0 errors.
- The simple example’s wrapper has no fixed pixel height and grows through a definite viewport-height flex chain.
- Menu and breadcrumbs remain outside the table area.
- `.ib-table__content` remains the table’s only scroll owner.
- At least one example still demonstrates an explicit exact `tableHeight`.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 2 — Strengthen the scroll-owner regression test [agent: unit-jasmine-executor] [model: `opencode/deepseek-v4-pro`] ✅ DONE

~~~
## TASK:
Make the Jasmine regression test prove that `.ib-table__content` is the sole table-owned scrollable element.

## CONTEXT:
`src/app/inobeta-ui/ui/kai-table/table.component.spec.ts:1179-1199` checks only five manually selected nodes. Additional table-owned wrappers or structural descendants can therefore become scrollable without failing the test.

## OBJECTIVE:
Cover the complete relevant desktop table DOM while retaining deterministic computed-style assertions.

## REQUIREMENTS:
1. Inspect the table host and all relevant owned desktop descendants rather than a manually selected five-element list.
2. Exclude overlays or document-root elements that are not descendants of the table fixture.
3. Detect scroll ownership through computed `overflow`, `overflow-x`, and `overflow-y`.
4. Assert that the only matching element is `.ib-table__content`.
5. Preserve all existing DEVK-1066 and table-height tests without disabling or weakening them.

## CONSTRAINTS:
- Modify only `src/app/inobeta-ui/ui/kai-table/table.component.spec.ts`.
- Do not change production code.
- Do not add arbitrary waits, `fit`, `fdescribe`, `xit`, or `xdescribe`.

## OUTPUT:
Report the assertion strategy, changed test, and exact focused-test result.

## ACCEPTANCE CRITERIA:
- `npx ng test --include='src/app/inobeta-ui/ui/kai-table/table.component.spec.ts' --watch=false` reports 0 failures.
- The assertion traverses the relevant table-owned DOM and fails if any element other than `.ib-table__content` acquires scrollable overflow.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 3 — Correct parent-mode documentation [agent: storybook-executor] [model: `opencode/gpt-5.6-luna`] ✅ DONE

~~~
## TASK:
Remove the contradictory description of how toolbar, filter, and paginator affect the content viewport.

## CONTEXT:
`src/app/inobeta-ui/ui/kai-table/table.mdx:772-777` correctly describes parent mode as residual flex space, but lines 808-810 state that sibling controls do not reduce the viewport in both modes.

## OBJECTIVE:
Document distinct, accurate sizing semantics for parent and exact modes.

## REQUIREMENTS:
1. State that toolbar, filter, and paginator consume parent space and therefore reduce `.ib-table__content` in parent mode.
2. State that in exact mode they remain outside the content and add to the component’s total height.
3. Keep the single-scroll and mobile-exclusion documentation unchanged.
4. Do not alter stories or implementation unless compilation requires it.

## CONSTRAINTS:
- Modify only `src/app/inobeta-ui/ui/kai-table/table.mdx`.
- Do not broaden the migration guide or introduce unrelated documentation changes.

## OUTPUT:
Report the corrected passage and Storybook validation result.

## ACCEPTANCE CRITERIA:
- `npm run build-storybook` completes with 0 build errors.
- The MDX no longer claims that sibling controls leave the parent-mode content viewport unchanged.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 4 — Remove unrelated branch changes [agent: task-executor] [model: `openai/gpt-5.6-sol`] ✅ DONE

~~~
## TASK:
Remove runner metadata and unrelated plan-state edits from the DEVK-1046 branch diff.

## CONTEXT:
The diff against `develop/20.0.0` includes `.agents-runner/.gitignore` and completion-marker changes in nine unrelated plans or feedback documents. None is authorized by DEVK-1046 Steps 1–4.

## OBJECTIVE:
Leave the branch diff scoped to the DEVK-1046 plan and its authorized implementation, test, example, story, and documentation files.

## REQUIREMENTS:
1. Remove `.agents-runner/.gitignore` from this ticket’s final diff.
2. Restore every unrelated plan/feedback file listed under “Files outside the plan scope” to its `develop/20.0.0` content.
3. Do not modify the DEVK-1046 original plan.
4. Do not alter any DEVK-1046 implementation file.

## CONSTRAINTS:
- Do not use destructive repository-wide reset or clean commands.
- Preserve unrelated local work if any appears before editing.
- If the plan-state edits are deliberately required in this branch, stop and request clarification instead of removing them.

## OUTPUT:
Report every path removed from the final diff and the final `git diff --name-status develop/20.0.0...HEAD` result.

## ACCEPTANCE CRITERIA:
- The final diff contains no `.agents-runner/.gitignore`.
- The final diff contains no modification to plans other than the DEVK-1046 plan and its feedback document.
- All DEVK-1046 implementation changes remain present.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

## Commands executed during this review

- `git status --short --branch && git branch --show-current && git rev-parse --verify "develop/20.0.0" && git diff --name-status "develop/20.0.0"...HEAD && git diff --stat "develop/20.0.0"...HEAD` → PASS (20 changed files; 1,024 insertions / 126 deletions).
- `git log --oneline --decorate -10` → PASS (branch and base history inspected).
- `git diff --find-renames --find-copies "develop/20.0.0"...HEAD -- <nine authorised implementation paths>` → PASS (scoped implementation diff inspected).
- `git diff --unified=0 "develop/20.0.0"...HEAD -- <outside-scope paths>` → PASS (unrelated changes classified).
- `npm run packagr` → PASS (1 entry point built / 0 errors).
- `npx ng test --include='src/app/inobeta-ui/ui/kai-table/table.component.spec.ts' --watch=false` → PASS (62 pass / 0 fail / 0 skipped).
- `npm run build` → PASS (4 initial chunks / 1 lazy chunk / 0 errors).
- `npm run build-storybook` → PASS (manager and preview built / 0 build errors; static output generated).
- `git status --short --branch` → PASS (working tree clean after validation).
PLAN>>>
