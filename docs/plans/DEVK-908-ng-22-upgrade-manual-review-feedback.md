# DEVK-908 — Angular 22 CI and release notes — Manual review remediation

## References

- Original plan: `devk-908-ng-22-upgrade`.
- Review date: `2026-08-07`.
- Source: manual validation by the user.

## Verdict

**FAIL**

Manual validation found a CI-only Vitest collection failure and stale v21 content in the Storybook What’s New page; no original requirement was changed, and unaffected parts of the original plan remain valid.

## Manual review summary

- Running `npm run test-ci` locally passes: 66 test files and 861 reported tests.
- Running the same command in GitLab CI under `node:26` fails because `filter.component.spec.ts` is collected with zero tests, despite containing seven tests.
- A fresh CI npm cache did not change the result, ruling out stale cache as the cause.
- Five other filter specs import a shared helper directly from `filter.component.spec.ts`, causing its test suite to be registered under importing test entries. Test attribution differs between local and CI execution.
- `src/whats_new.mdx` still presents the v21 release. The expected current page must instead introduce v22 and state Angular 22 compatibility, without additional release notes.

## Reviewed steps

### Step 9 — Stabilizzare l'intera suite sotto Vitest

- **Original plan state**: `[DONE]`
- **Reported behaviour**: `npm run test-ci` passes locally, but GitLab CI reports `filter.component.spec.ts (0 test)` followed by `Error: No test suite found in file`.
- **Expected behaviour**: the complete Vitest suite must pass consistently in local and CI environments, as required by Step 9.
- **Classification**: `architectural problem`
- **Issues found**:
  - `[BLOCKER]` Five executable spec files import `createFilterComponent` from another executable spec file (`src/app/inobeta-ui/ui/kai-filter/filter.component.spec.ts:123-145`, `src/app/inobeta-ui/ui/kai-filter/filters/search-bar/search-bar.component.spec.ts:3`, `src/app/inobeta-ui/ui/kai-filter/filters/tag/filter-tag.component.spec.ts:8`, `src/app/inobeta-ui/ui/kai-filter/filters/number/filter-number.component.spec.ts:9`, `src/app/inobeta-ui/ui/kai-filter/filters/date/filter-date.component.spec.ts:11`, `src/app/inobeta-ui/ui/kai-filter/filters/text/filter-text.component.spec.ts:10`). Impact: importing the file executes its `describe` block as a dependency; Vitest’s Angular builder attributes those seven tests differently depending on module evaluation order, leaving the original CI test entry empty and failing the suite. Recommendation: move only the shared fixture setup into an excluded `*.stub.spec.ts` helper and stop importing executable spec entries.
  - `[WARNING]` Local execution reports 35 duplicate test registrations: each of the five importers acquires the seven `IbFilter` tests in addition to its own tests (`src/app/inobeta-ui/ui/kai-filter/filter.component.spec.ts:12-121`). Impact: the local total of 861 does not represent 861 independent tests and concealed the CI collection defect. Recommendation: preserve every assertion while ensuring each test is registered exactly once.

### Step 10 — Portare la CI a Node 26 e coverage Vitest

- **Original plan state**: `[DONE]`
- **Reported behaviour**: the GitLab `test_unit` job runs under `node:26`, completes installation and compilation, passes 65 test files, then exits with code 1 because one spec entry has no suite.
- **Expected behaviour**: the Node 26 Vitest job must exit with code 0 and publish coverage from a complete successful run.
- **Classification**: `cross-cutting impact`
- **Issues found**:
  - `[BLOCKER]` The `test_unit` job cannot satisfy its pipeline contract because the cross-spec import makes test discovery environment-dependent (`.gitlab-ci.yml:39-48`, `src/app/inobeta-ui/ui/kai-filter/filter.component.spec.ts:123-145`). Impact: CI remains red even though the same command passes locally; `allow_failure: true` prevents it from blocking later stages but does not make the validation successful. Recommendation: correct test-file isolation rather than changing the runner, cache, coverage thresholds, or CI command.

### Step 11 — Verificare l'upgrade Angular 22 integrato

- **Original plan state**: `[DONE]`
- **Reported behaviour**: the current Storybook What’s New page still contains only v21 release information.
- **Expected behaviour**: the user requires the current What’s New page to be initialized for v22, stating Angular 22 compatibility and no additional release information.
- **Classification**: `missing requirement`
- **Issues found**:
  - `[BLOCKER]` The What’s New page still identifies the current release as `Version 21.0.0`, describes removed v21 components, and advertises Angular 21 compatibility (`src/whats_new.mdx:7-36`). Impact: generated Storybook documentation presents the previous major release instead of v22. Recommendation: retain the existing page metadata but replace the v21 body with a minimal v22 Angular 22 compatibility entry.
  - `[NIT]` Step 11 required Storybook to build but did not require updating release-page content. This finding therefore adds missing documentation scope; it does not prove the original plan requirement was implemented incorrectly (`src/whats_new.mdx:1-36`).

## Confirmed requirement changes

- None.

The user confirmed the scope of a newly identified documentation requirement, but it does not replace or contradict any original DEVK-908 requirement.

## Impact analysis

- **Other steps of the original plan**: The test isolation fix reaches Steps 9, 10, and the `npm run test-ci` validation in Step 11. Steps 1–8 remain valid except for the narrow Step 9 test structure involved here. The documentation addition was not specified by any original step and invalidates none.
- **Components that depend on the changed behaviour**: Five Kai Filter specs depend on `createFilterComponent` and must import it from the new test helper. Production `IbFilter`, `IbFilterModule`, filter operators, queries, and UI rendering are not affected.
- **Application state, contracts between modules, API surface, persistence**: Not affected. No production source, NgRx state, module contract, public export, URL state, or persisted data changes are required.
- **Backward compatibility**: Not affected. The extracted helper is test-only and must not become part of the library public API.
- **Automated tests and validations that assert the old behaviour**: No valid test asserts cross-spec imports or duplicate registration. After isolation, the five importing specs must report only their own tests, while `filter.component.spec.ts` must continue reporting its seven tests. The local aggregate count is expected to decrease because 35 duplicate registrations disappear, not because coverage is removed. `npm run test-ci` and the GitLab `test_unit` job must pass.
- **Documentation**: Only `src/whats_new.mdx` changes. `CHANGELOG.md`, component guides, API documentation, and historical release records are not affected.
- **Already-implemented features that keep working**: Angular 22 compatibility, Node 26 configuration, Vitest/Jasmine compatibility, coverage thresholds, application build, library packaging, Storybook build, Kai Filter behaviour, and all existing functional expectations must continue working.
- **Scope size**: The work is not materially larger than reported. It contains two independent, narrow fixes routed to separate executors: test isolation and one Storybook MDX update.

## Assumptions

- None.

## Remediation plan

### Remediation 1 — Isolate shared Kai Filter test setup [agent: unit-jasmine-executor] [model: `openai/gpt-5.6-sol`] ✅ DONE [2026-08-07T10:20:59.632Z]

- **Dipendenze**: none.
- **File consentiti**: `src/app/inobeta-ui/ui/kai-filter/filter.component.spec.ts`, `src/app/inobeta-ui/ui/kai-filter/filter.component.stub.spec.ts`, `src/app/inobeta-ui/ui/kai-filter/filters/search-bar/search-bar.component.spec.ts`, `src/app/inobeta-ui/ui/kai-filter/filters/tag/filter-tag.component.spec.ts`, `src/app/inobeta-ui/ui/kai-filter/filters/number/filter-number.component.spec.ts`, `src/app/inobeta-ui/ui/kai-filter/filters/date/filter-date.component.spec.ts`, `src/app/inobeta-ui/ui/kai-filter/filters/text/filter-text.component.spec.ts`
- **Origine**: `architectural problem`
- **Tipo**: ordinary fix.

**Prompt**:

~~~
## TASK:
Remove executable cross-spec imports from the Kai Filter test suites.

## CONTEXT:
DEVK-908 Step 9 requires the complete Vitest suite to pass consistently. `filter.component.spec.ts` exports `createFilterComponent` at lines 123-145, and five other executable specs import it. Local execution registers the seven `IbFilter` tests repeatedly; GitLab CI assigns them to an importer and leaves the original entry with zero tests, causing `Error: No test suite found in file`.

## OBJECTIVE:
Register every Kai Filter test exactly once and make full-suite collection deterministic under local and GitLab Node 26 execution.

## REQUIREMENTS:
1. Create `filter.component.stub.spec.ts` containing only the shared TestBed/fixture setup required by `createFilterComponent`.
2. Keep the seven `IbFilter` tests in `filter.component.spec.ts`; import the helper from the new stub instead of exporting test utilities from the executable spec.
3. Update the five dependent filter specs to import the helper from `filter.component.stub.spec.ts`.
4. Ensure the helper file contains no `describe`, `it`, `test`, focused test, or disabled test.
5. Preserve all existing assertions and functional expectations.
6. Run the Kai Filter specs together as a regression check and confirm `filter.component.spec.ts` reports seven tests while each importer reports only its own tests.
7. Run the complete suite and verify coverage remains at least 80% for statements, branches, functions, and lines.

## CONSTRAINTS:
- Do not modify production source.
- Do not modify `src/vitest-jasmine-compat.ts`, `src/test.ts`, `angular.json`, package files, CI configuration, cache keys, coverage thresholds, or runner settings.
- Do not convert Jasmine APIs to Vitest APIs.
- Do not disable tests or replace assertions.
- Do not add public exports.
- Keep the existing permissive compiler baseline and all unaffected DEVK-908 requirements.

## OUTPUT:
Report files changed, removed cross-spec imports, per-file test collection after isolation, full-suite result, and coverage totals.

## ACCEPTANCE CRITERIA:
- No executable Kai Filter spec imports from `filter.component.spec.ts`.
- `npx ng test --include='src/app/inobeta-ui/ui/kai-filter/**/*.spec.ts' --watch=false --coverage=false` exits 0.
- `filter.component.spec.ts` reports seven tests, with no duplicate `IbFilter` suite attributed to importer files.
- `npm run test-ci` exits 0 with all four coverage categories at least 80%.
- The GitLab `test_unit` job under `node:26` exits 0 without `No test suite found`.
- No production or public API file changes.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 2 — Initialize What’s New for v22 [agent: storybook-executor] [model: `openai/gpt-5.6-sol`] ✅ DONE [2026-08-07T10:22:01.875Z]

- **Dipendenze**: none.
- **File consentiti**: `src/whats_new.mdx`
- **Origine**: `missing requirement`
- **Tipo**: ordinary fix.

**Prompt**:

~~~
## TASK:
Replace the current v21 What’s New content with the initial v22 release entry.

## CONTEXT:
Manual review found that `src/whats_new.mdx:7-36` still presents Version 21.0.0, removed v21 components, Storybook 10 migration, and Angular 21 compatibility. The user requires the current page to introduce Version 22.0.0 and state Angular 22 compatibility, with no additional release information for now.

## OBJECTIVE:
Make Storybook’s current What’s New page accurately present the v22 release.

## REQUIREMENTS:
1. Preserve the existing MDX import, Storybook metadata, page title, and valid MDX structure.
2. Remove the v21 release body from the current page.
3. Add a Version 22.0.0 section stating that the library is compatible with Angular 22.
4. Keep the release entry intentionally minimal.
5. Validate the page through the Storybook build.

## CONSTRAINTS:
- Do not add migration notes, breaking changes, feature highlights, Node 26 details, Vitest details, or unsupported compatibility claims.
- Do not invent a release date if no confirmed release date is available.
- Do not modify `CHANGELOG.md`, other MDX files, stories, production source, translations, or Storybook configuration.
- Do not retain statements presenting v21 as the current release.
- Preserve all unaffected DEVK-908 implementation and validation requirements.

## OUTPUT:
Report the replaced v21 sections, resulting v22 wording, modified file, and Storybook build result.

## ACCEPTANCE CRITERIA:
- `src/whats_new.mdx` contains `Version 22.0.0`.
- `src/whats_new.mdx` states Angular 22 compatibility.
- The current page contains no `Version 21.0.0` or Angular 21 compatibility section.
- `npm run build-storybook` exits 0.
- No file other than `src/whats_new.mdx` changes.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~
