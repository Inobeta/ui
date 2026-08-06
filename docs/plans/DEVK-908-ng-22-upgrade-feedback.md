# DEVK-908 — Angular 22, Node 26 e Vitest — Post-implementation feedback

## References
- Original plan: `docs/plans/DEVK-908-ng-22-upgrade.md`.
- Branch reviewed: `develop/22.0.0` vs `origin/develop/22.0.0`.
- Review date: `2026-08-06`.

## Verdict
**FAIL**

One integrated review step was evaluated. Six BLOCKERs, three WARNINGs, and zero NITs were found. Build, Vitest, coverage, Storybook, startup, HTTP availability, and NgRx ESM checks passed under Node 26; lint and library packaging failed, and public/functional compatibility requirements are not met.

## Reviewed steps

### Step 11 — Verificare l upgrade Angular 22 integrato
- **Original plan state**: not marked `[DONE]` because this is the review unit.
- **Acceptance criteria**: 5 passed / 9 evaluated gates. Version alignment, NgRx ESM, startup/HTTP, coverage, and static prohibited-pattern checks passed; the complete automated command set, Karma removal, public API stability, and behavior stability failed.
- **Verification commands**: 3 pass / 2 fail for the mandatory automated set; manual startup passed.
- **Expected files**: `package.json`, `package-lock.json`, `.nvmrc`, `angular.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.spec.json`, `eslint.config.js`, `.gitlab-ci.yml`, `src/`.
- **Files actually changed** (diff vs develop): configuration files listed above; `src/test.ts`; `src/vitest-jasmine-compat.ts`; `src/vitest-jasmine-compat.spec.ts`; targeted HTTP, Kai Table, Material Forms, Uploader, and Views specs; production files under `src/app/inobeta-ui/core/`, `ui/kai-table-mobile/`, and `ui/material-forms/`. No `public_api.ts` or `index.ts` diff exists. Four required implementation files remain untracked: `.nvmrc`, `src/vitest-jasmine-compat.ts`, `src/vitest-jasmine-compat.spec.ts`, and `src/app/inobeta-ui/ui/material-forms/controls/material-control-data.ts`.
- **Issues found**:
  - `[BLOCKER]` `npm run lint` exits `1` with 2,685 errors because generated legacy reports under `src/coverage/` are linted after `eslint.config.js` changed the only coverage ignore to `coverage/**`. Mandatory validation does not complete with code 0.
  - `[BLOCKER]` `npm run packagr` exits `1` with extensive TypeScript and Angular template diagnostics across Kai Filter, Forms, Kai Table, Data Export, Views, and other library entry-point sources. Library publication is broken despite the demo production build passing.
  - `[BLOCKER]` `tsconfig.app.json:26` changes `strictTemplates` from `false` to `true`, directly contradicting the approved deferred-strictness policy and Steps 2/11. This drove out-of-scope type cleanup instead of preserving the requested baseline.
  - `[BLOCKER]` Karma configuration still exists at `src/karma.conf.js:1-51`, including Jasmine, Chrome, reporters, and coverage settings. Karma packages are absent from top-level installed dependencies and Vitest is the active runtime, but the explicit requirement that Karma no longer be configured is unmet.
  - `[BLOCKER]` Eleven exported deprecated Material Forms components change `data` to a required Angular input typed with new internal `IbMaterialControlData`, for example `src/app/inobeta-ui/ui/material-forms/controls/autocomplete.ts:48`, `button.ts:26`, and `datepicker.ts:35`. `material-forms/index.ts` exports these component declarations but does not export `material-control-data.ts`; consumers therefore receive tightened required-input contracts referring to a package-internal type. This is an unapproved public API change.
  - `[BLOCKER]` Production behavior changed outside compatibility scope: custom errors without `params` no longer render (`material-form-control.component.ts:95-103` and `.html:38-40`); empty datepicker values changed from `null` to `undefined` (`controls/datepicker.ts:53-55`); missing button handlers now silently no-op (`controls/button.ts:41,46`). Functional changes are blockers by Unit 11 constraints.
  - `[WARNING]` Required implementation files are untracked. Current tests consume them successfully, but omission from the delivered change would break compilation or test setup.
  - `[WARNING]` `src/vitest-jasmine-compat.ts:85-89` globally monkey-patches public `ComponentFixture.whenStable()` to call `detectChanges()`. This is broader than Jasmine namespace compatibility and can hide invalid test setup.
  - `[WARNING]` The shell initially resolved Node `v24.8.0`; Angular CLI rejected it. Node `v26.7.0` is installed and all subsequent validation used its explicit PATH. `.nvmrc` correctly contains `26`, but local runtime activation is not automatic.
- **Notes**:
  - Installed versions under Node 26: Node `26.7.0`, npm `11.19.0`, Angular CLI `22.1.3`, Angular Core `22.1.0`, TypeScript `6.0.3`, Vitest `4.1.10`, NgRx Store/Effects/Store Devtools `22.0.0-rc.0`.
  - `npm ci --no-audit --no-fund`, `npx ng version`, production build, tests, Storybook, and startup emitted no `exports is not defined in ES module scope` error.
  - `npm run test-ci` passed 64 files and 857 tests. Coverage: statements 87.07%, branches 80.02%, functions 84.03%, lines 87.24%. Configured thresholds remain 80% at `angular.json:111-116`.
  - `npm start -- --host 127.0.0.1 --port 4201` completed initial compilation in 7.652s; `http://127.0.0.1:4201/` returned HTTP 200.
  - `src/test.ts` contains no TestBed import or `initTestEnvironment()` call.
  - No newly added explicit TypeScript `any`, focused/disabled test (`fdescribe`, `fit`, `xdescribe`, `xit`, `.skip`, `.only`), or new private Angular/Material API access was found in the diff.

## Files outside the plan scope

- `[WARNING]` `test.pdf` — untracked test-generated artifact outside Unit 11 implementation scope.

## Scope Check

Implementation touched only planned configuration/test/production areas, except the generated `test.pdf`. Executor boundaries were generally respected. However, enabling strict templates and changing deprecated Material Forms public contracts expanded scope beyond the approved compatibility-only upgrade.

## Convention Violations

- New public declaration type `IbMaterialControlData` is imported from an internal file rather than exposed through the Material Forms barrel, violating barrel/public API consistency.
- `strictTemplates: true` violates the explicit DEVK-908 template-safety baseline, even though modified templates themselves contain no TypeScript casts.
- No new hardcoded user-facing strings or translation-key changes were found.

## Missing Validation

- Library package cannot be produced; consumer declaration/API validation is therefore unavailable.
- Lint cannot complete in the current workspace while legacy `src/coverage/` exists.
- No regression test covers a `customError` containing `message` without `params`.
- No consumer-facing compile check covers direct use of the exported deprecated Material Forms components after their required-input change.

## Remediation plan

### Remediation 1 — Restore permissive compiler baseline and packaging [agent: task-executor] [model: `openai/gpt-5.6-sol`] ✅ DONE [2026-08-06T19:48:02.896Z]

**Observed problem**: `strictTemplates` was enabled against plan and `npm run packagr` fails across the library.

**Original step**: 2 — Preservare la baseline TypeScript permissiva; 11 — Verificare l upgrade Angular 22 integrato.

**Prompt for the agent**:

~~~
## TASK:
Restore the approved permissive Angular 22 compiler baseline and make library packaging pass.

## CONTEXT:
`tsconfig.app.json` incorrectly has `strictTemplates: true`; DEVK-908 requires `false`. `npm run packagr` currently fails with broad strictness diagnostics.

## OBJECTIVE:
Make `npm run packagr` exit 0 without production behavior or public API changes.

## REQUIREMENTS:
1. Restore `strictTemplates: false` where required by the approved plan.
2. Diagnose the effective ng-packagr compiler configuration.
3. Apply only configuration-level compatibility changes needed to preserve the pre-upgrade permissive baseline.
4. Keep ordinary TypeScript and Angular API checks enabled.

## CONSTRAINTS:
- Do not modify production or test source.
- Do not use `skipLibCheck` to hide application errors.
- Do not increase strictness or change public contracts.

## OUTPUT:
Report modified configuration files, effective compiler settings, and packaging result.

## ACCEPTANCE CRITERIA:
- `npx tsc -p tsconfig.app.json --showConfig` reports `strict: false`.
- `tsconfig.app.json` and `tsconfig.spec.json` retain `strictTemplates: false`.
- `npm run packagr` exits 0.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 2 — Revert Material Forms contract regressions [agent: task-executor] [model: `openai/gpt-5.6-sol`] ✅ DONE [2026-08-06T19:55:57.854Z]

**Observed problem**: Required-input/type changes and custom-error, datepicker, and button behavior changes violate API and functional compatibility.

**Original step**: 4 — Risolvere le incompatibilità residue dei Material Forms.

**Prompt for the agent**:

~~~
## TASK:
Remove DEVK-908 Material Forms public API and behavior regressions.

## CONTEXT:
Deprecated exported controls now expose required `data` inputs typed through internal `IbMaterialControlData`; custom errors without params disappear; datepicker empty values changed; missing handlers silently no-op.

## OBJECTIVE:
Preserve pre-upgrade Material Forms contracts and runtime semantics while compiling on Angular 22.

## REQUIREMENTS:
1. Restore behavior-equivalent public input contracts for all affected Material Forms controls.
2. Avoid exposing package-internal types through public component declarations.
3. Render custom errors when a valid message exists even if params are absent.
4. Preserve prior empty datepicker value semantics.
5. Preserve prior button-handler invocation semantics.
6. Add narrow regression tests for each restored behavior.

## CONSTRAINTS:
- Do not redesign Material Forms.
- Do not change translation keys or visible content.
- Do not introduce `any`.
- Do not broaden native Vitest refactoring.

## OUTPUT:
Report restored contracts, behavior tests, and modified files.

## ACCEPTANCE CRITERIA:
- `npm run build` exits 0.
- `npm run packagr` exits 0.
- Relevant Material Forms Vitest specs pass.
- No new public symbol is added, removed, or renamed.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 3 — Complete Karma and lint cleanup [agent: task-executor] [model: `openai/gpt-5.6-sol`] ✅ DONE [2026-08-06T19:58:09.744Z]

**Observed problem**: `src/karma.conf.js` remains configured and lint fails on legacy generated coverage reports.

**Original step**: 8 — Completare il passaggio da Karma a Vitest.

**Prompt for the agent**:

~~~
## TASK:
Complete obsolete Karma cleanup and restore a green lint gate.

## CONTEXT:
Vitest is active and no top-level Karma packages are installed, but `src/karma.conf.js` remains. ESLint ignores only `coverage/**`, while existing generated `src/coverage/**` causes thousands of parser errors.

## OBJECTIVE:
Remove obsolete Karma configuration and make lint robust against supported and legacy generated coverage locations.

## REQUIREMENTS:
1. Remove the obsolete Karma configuration file.
2. Confirm no script or Angular target references Karma.
3. Ignore generated coverage roots without excluding source files.
4. Preserve Vitest scripts, runner, reporters, and 80% thresholds.

## CONSTRAINTS:
- Do not add or update dependencies.
- Do not modify specs or production source.
- Do not lower lint or coverage rules.

## OUTPUT:
Report removed configuration, remaining optional lockfile peer metadata, and lint result.

## ACCEPTANCE CRITERIA:
- No `src/karma.conf.js` exists.
- `npm ls karma jasmine-core --depth=0` is empty.
- `npm run lint` exits 0.
- `npm run test-ci` exits 0.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 4 — Narrow Vitest compatibility setup [agent: task-executor] [model: `openai/gpt-5.6-sol`] ✅ DONE [2026-08-06T20:06:13.851Z]

**Observed problem**: The compatibility layer globally changes `ComponentFixture.whenStable()` semantics beyond Jasmine API emulation.

**Original step**: 8 — Completare il passaggio da Karma a Vitest; 9 — Stabilizzare l intera suite sotto Vitest.

**Prompt for the agent**:

~~~
## TASK:
Remove the global ComponentFixture semantic patch from the Vitest compatibility layer.

## CONTEXT:
`src/vitest-jasmine-compat.ts` overrides `ComponentFixture.prototype.whenStable()` to call `detectChanges()` first. DEVK-908 permits only narrow Jasmine compatibility.

## OBJECTIVE:
Keep the Vitest suite green without globally changing Angular fixture behavior.

## REQUIREMENTS:
1. Remove the global `whenStable()` override.
2. Identify tests that relied on the implicit `detectChanges()` call.
3. Make only narrow runner-compatibility adjustments where necessary.
4. Preserve existing functional expectations.

## CONSTRAINTS:
- Do not modify production source.
- Do not perform broad Jasmine-to-Vitest refactoring.
- Do not disable tests or lower coverage.

## OUTPUT:
Report affected specs, compatibility changes, test count, and coverage.

## ACCEPTANCE CRITERIA:
- No `ComponentFixture.prototype.whenStable` assignment remains.
- `npm run test-ci` exits 0 with all four coverage categories at least 80%.
- No focused or disabled test is introduced.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

## Commands executed during this review

- `git status --short --branch && git log --oneline -10 && git diff --stat origin/develop...HEAD && git diff --name-status origin/develop...HEAD` → FAIL, exit 128 (`origin/develop` does not exist; repository uses versioned develop branches).
- `node --version && npm --version && npx ng version && npm ls ...` with default PATH → FAIL (Node `v24.8.0`; Angular CLI rejected it).
- `ls "$HOME/.nvm/versions/node"` → PASS, exit 0 (Node `v26.7.0` available).
- `git merge-base HEAD origin/develop/22.0.0` → PASS, exit 0 (`a019c162...`).
- `PATH=.../v26.7.0/bin:$PATH npm ci --no-audit --no-fund` → PASS, exit 0; NgRx ESM error absent.
- `PATH=.../v26.7.0/bin:$PATH npx ng version` → PASS, exit 0.
- `PATH=.../v26.7.0/bin:$PATH npm ls typescript vitest @ngrx/store @ngrx/effects @ngrx/store-devtools @angular/core @angular/cli --depth=0` → PASS, exit 0.
- `PATH=.../v26.7.0/bin:$PATH npm run lint` → FAIL, exit 1 (2,685 errors from `src/coverage/**`; 815 warnings overall).
- `PATH=.../v26.7.0/bin:$PATH npm run packagr` → FAIL, exit 1 (library TypeScript/template compilation errors).
- `PATH=.../v26.7.0/bin:$PATH npm run build` → PASS, exit 0.
- `PATH=.../v26.7.0/bin:$PATH npm run test-ci` → PASS, exit 0 (64 files, 857 tests, coverage thresholds passed).
- `PATH=.../v26.7.0/bin:$PATH npm run build-storybook` → PASS, exit 0.
- `PATH=.../v26.7.0/bin:$PATH npm start -- --host 127.0.0.1 --port 4201` plus `curl http://127.0.0.1:4201/` → PASS, exit 0; initial compilation succeeded and HTTP 200 returned.
- `PATH=.../v26.7.0/bin:$PATH npm ls karma jasmine-core karma-jasmine karma-chrome-launcher --depth=0` → expected empty tree, command exit 1; no top-level runtime packages installed.
- `git diff --check` → PASS, exit 0.
- Static searches for new `any`, focused/disabled tests, private Angular/Material APIs, `public_api.ts`, and `index.ts` diffs → PASS; no prohibited additions found.
