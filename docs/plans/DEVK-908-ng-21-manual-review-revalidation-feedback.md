# DEVK-908 — Angular 21 manual remediation revalidation — Post-implementation feedback

## References
- Original plan: `docs/plans/DEVK-908-ng-21-manual-review-feedback.md`.
- Branch reviewed: `develop/21.0.0` vs `origin/develop/21.0.0`.
- Review date: `2026-08-06`.

## Verdict
**FAIL**

One review unit assessed. Navigation and mobile-empty remediations pass, clean installation resolves both `oxc-parser` bindings, and 781 tests pass. Release acceptance still fails with 3 BLOCKER and 1 WARNING: clean Storybook build cannot resolve `html2canvas`, configured coverage is not enforced by `npm run test-ci`, and measured coverage remains below 80% in all four dimensions.

## Reviewed steps

### Step 7 — Revalidate the repaired release candidate
- **Original plan state**: not marked `[DONE]`; source unit is Remediation R7.
- **Acceptance criteria**: 6 / 8 passed.
- **Verification commands**: 15 pass / 2 fail / 1 skipped.
- **Expected files**: `package.json`, `package-lock.json`, `.gitlab-ci.yml`, `angular.json`, `.storybook/`, `src/app/examples/nav/`, `src/app/examples/side-menu/`, `src/assets/i18n/it.json`, `src/app/inobeta-ui/ui/kai-table-mobile/`, `src/app/inobeta-ui/ui/kai-table/table.component.html`.
- **Files actually changed** (diff vs develop): `docs/plans/DEVK-908-ng-21-manual-review-feedback.md`, `package.json`, `package-lock.json`, `src/app/examples/nav/nav.component.{ts,html,css,spec.ts}`, `src/app/examples/side-menu/app-side-menu.component.{ts,html,css,spec.ts}`, `src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.{ts,spec.ts}`, `src/assets/i18n/it.json`; untracked `.npm/` cache and `package-lock.json.bak` also exist.
- **Issues found**:
  - `[BLOCKER]` A genuinely clean install succeeds and fixes `oxc-parser`, but Storybook still fails from that clean state: Vite cannot resolve optional `jspdf` import `html2canvas`. The lock declares `html2canvas` under `jspdf.optionalDependencies` but contains no installed package record (`package-lock.json:11292-11308`; dependency entry at `package.json:73-74`). Impact: `npm run build-storybook` exits non-zero, so the required release chain and GitLab documentation artifact remain blocked.
  - `[BLOCKER]` `npm run test-ci` requests code coverage but the Karma reporter list omits `coverage`; therefore the command exits 0 without producing current totals or enforcing configured thresholds (`package.json:9`, `src/karma.conf.js:18-26,36`). Impact: the release gate can report green while coverage is below policy.
  - `[BLOCKER]` A full 781-test run with the coverage reporter explicitly enabled measures Statements 78.04% (2605/3338), Branches 68.84% (855/1242), Functions 74.28% (728/980), and Lines 78.54% (2402/3058), all below the required 80% (`src/coverage/Chrome Headless 144.0.0.0 (Linux 0.0.0)/index.html:25-49`). Impact: original DEVK-908 coverage acceptance remains unsatisfied even though all tests pass.
  - `[WARNING]` `package-lock.json.bak` is an untracked remediation artifact outside the allowed file set. It should not be included in the release change.
- **Notes**:
  - Clean installation was established by moving the existing `node_modules` outside the workspace, then running `npm ci --cache .npm --prefer-offline --no-audit --no-fund`; 1175 packages installed, exit 0. The literal destructive `rm -rf` prefix was skipped under reviewer safety constraints, without reusing any prior dependency tree.
  - `npm ls` confirms root `oxc-parser@0.121.0` uses `@oxc-parser/binding-linux-x64-gnu@0.121.0`, while Storybook's nested `oxc-parser@0.127.0` uses binding 0.127.0. Direct root import succeeds. No `Cannot find native binding` error occurred.
  - Route/link parity passes: base and current side-menu lists contain the same ordered 16 URLs. `src/app/routing.module.ts` and `public_api.ts` have no diff.
  - Side-menu observable checks pass: three groups start expanded, independently collapse/reopen, and expose `aria-expanded`; default Material icons match the font loaded by `src/index.html:9-11`; square token-based blocks and hover/active states are present (`src/app/examples/side-menu/app-side-menu.component.html:1-28`, `src/app/examples/side-menu/app-side-menu.component.css:17-65`). Targeted suites: 6/6 pass.
  - Responsive navigation checks pass: desktop is open in `side` mode; mobile starts closed in `over` mode and the translated hamburger control opens/closes it (`src/app/examples/nav/nav.component.ts:12-40`, `src/app/examples/nav/nav.component.html:1-28`). The route-content flex/min-height/overflow chain remains (`src/app/examples/nav/nav.component.css:7-38`).
  - Mobile table checks pass: empty, non-loading sources render `.table-empty`; loading suppresses it; populated sources render cards and suppress the fallback (`src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.ts:51-80,236-240`). Targeted suite: 17/17 pass.
  - No diff exists in routes, public API, Storybook content/configuration, CI configuration, persistence, desktop Kai Table logic, hydration, or original DEVK-908 removals. Historical removal mentions in `src/whats_new.mdx` are expected.

## Files outside the plan scope

- `[WARNING]` `package-lock.json.bak` — untracked backup artifact created during dependency remediation.
- `[EXPECTED LOCAL ARTIFACT]` `.npm/` — cache created by the required clean-install command; not part of implementation scope and must remain uncommitted.

## Convention Violations

No new `inobeta-ui-conventions`, i18n, or Angular template-safety violation was found in the remediation diff. Public API and library contract boundaries remain unchanged.

## Missing Validation

- No successful clean-state Storybook build because `html2canvas` is absent after `npm ci`.
- No passing coverage gate at the required 80% thresholds.
- `npm run test-ci` does not currently activate the coverage reporter, so its exit code does not validate coverage policy.

## Remediation plan

### Remediation 1 — Repair clean Storybook optional dependency installation [agent: task-executor] [model: `openai/gpt-5.6-sol`] ✅ DONE [2026-08-06T12:31:08.031Z]

**Observed problem**: Clean `npm ci` installs both `oxc-parser` native bindings, but Storybook fails because `jspdf` dynamically imports missing `html2canvas`.

**Original step**: 7 — Revalidate the repaired release candidate.

**Prompt for the agent**:

~~~
## TASK:
Repair clean Storybook installation so the `jspdf` optional import `html2canvas` resolves.

## CONTEXT:
After a genuinely clean `npm ci`, `npm run build-storybook` fails while bundling `jspdf/dist/jspdf.es.min.js`: Vite cannot resolve `html2canvas`. `package-lock.json` declares it under `jspdf.optionalDependencies` but records no installed `node_modules/html2canvas` package. The repaired root and nested `oxc-parser` bindings must remain intact.

## OBJECTIVE:
Make lockfile-driven clean installation reproducibly install every dependency required by Storybook and complete the Storybook 10 build.

## REQUIREMENTS:
1. Modify only `package.json` and `package-lock.json`.
2. Start from a genuinely clean dependency tree.
3. Resolve `html2canvas` deterministically without weakening Storybook/Vite configuration.
4. Preserve Storybook 10.5.5, `@storybook/angular-vite`, root `oxc-parser@0.121.0`, and both native binding records.
5. Review the lock diff and avoid unrelated upgrades.

## CONSTRAINTS:
Do not externalize or silence the missing import, change CI commands, edit Storybook content/configuration, add platform-specific runtime hacks, or modify application/library source.

## OUTPUT:
Return dependency cause, changed package records, clean-install result, `oxc-parser` import/binding checks, and Storybook build result.

## ACCEPTANCE CRITERIA:
- A clean `npm ci --cache .npm --prefer-offline --no-audit --no-fund` exits 0.
- `npm ls html2canvas oxc-parser @oxc-parser/binding-linux-x64-gnu` resolves required packages.
- `npm run build-storybook` exits 0 with neither `html2canvas` resolution nor `oxc-parser` native-binding errors.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 2 — Enforce coverage in the CI test command [agent: task-executor] [model: `openai/gpt-5.6-sol`] ✅ DONE [2026-08-06T12:33:31.547Z]

**Observed problem**: `npm run test-ci` passes without activating Karma's coverage reporter, so configured thresholds are not enforced.

**Original step**: 7 — Revalidate the repaired release candidate.

**Prompt for the agent**:

~~~
## TASK:
Make the existing CI test command generate coverage totals and enforce configured thresholds.

## CONTEXT:
`package.json` runs `ng test --code-coverage --watch=false`, and `src/karma.conf.js` configures 80% thresholds, but its explicit reporters list omits `coverage`. The command currently exits 0 with no current coverage report even when measured totals are below 80%.

## OBJECTIVE:
Ensure `npm run test-ci` cannot pass unless statements, lines, branches, and functions each meet 80%.

## REQUIREMENTS:
1. Modify only `src/karma.conf.js` and `package.json` if required.
2. Activate the supported Karma coverage reporter in the normal CI command.
3. Emit machine-readable or console-visible totals.
4. Keep all four 80% thresholds unchanged.
5. Do not alter test selection or browser semantics.

## CONSTRAINTS:
Do not lower thresholds, exclude new source, suppress failures, skip tests, or modify production/spec files.

## OUTPUT:
Return changed configuration, reporter behavior, command result, and emitted coverage totals.

## ACCEPTANCE CRITERIA:
- `npm run test-ci` generates a fresh coverage report.
- The command exits non-zero while any configured global metric is below 80%.
- All 781 tests still execute.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 3 — Restore DEVK-908 coverage thresholds [agent: unit-jasmine-executor] [model: `openai/gpt-5.6-sol`] ✅ DONE [2026-08-06T13:53:27.993Z]

**Observed problem**: Measured full-suite coverage is below 80% for statements, branches, functions, and lines.

**Original step**: 7 — Revalidate the repaired release candidate.

**Prompt for the agent**:

~~~
## TASK:
Add focused Jasmine coverage until every configured global metric reaches at least 80%.

## CONTEXT:
The 781-test suite passes, but an explicit coverage run reports Statements 78.04%, Branches 68.84%, Functions 74.28%, and Lines 78.54%. Coverage enforcement is handled separately; this step may modify specs only.

## OBJECTIVE:
Restore the original DEVK-908 80% coverage invariant through meaningful observable-behavior tests.

## REQUIREMENTS:
1. Modify only `**/*.spec.ts` and `**/*.stub.spec.ts`.
2. Use the generated coverage report to target maintained code with real uncovered behavior.
3. Prioritize branch and function gaps without duplicating existing assertions.
4. Preserve all 781 existing tests and new navigation/mobile-empty regressions.
5. Run the full suite with coverage reporting enabled and report exact totals.

## CONSTRAINTS:
Do not edit production/configuration files, exclude source, lower thresholds, inspect private Angular/Material APIs, or add focused/skipped tests.

## OUTPUT:
Return changed specs, behavior covered, full test result, and final statements/branches/functions/lines totals.

## ACCEPTANCE CRITERIA:
- All tests pass.
- Statements, branches, functions, and lines are each at least 80%.
- Navigation and mobile-empty targeted suites remain green.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

## Commands executed during this review

Chronological command results:

- `git status --short --branch && git log --oneline -10` → PASS.
- `git diff --name-status origin/develop...HEAD` → FAIL (`origin/develop` does not exist); matching base `origin/develop/21.0.0` was used.
- `git diff --name-status origin/develop/21.0.0 && git diff --stat origin/develop/21.0.0` → PASS.
- `git diff --check origin/develop/21.0.0` → PASS.
- `mv node_modules /tmp/opencode/inobeta-ui-node_modules-r7-preclean && npm ci --cache .npm --prefer-offline --no-audit --no-fund` → PASS (1175 packages; clean dependency tree). Literal `rm -rf node_modules` form → SKIPPED (reviewer destructive-command prohibition).
- `node -e "import('oxc-parser')..."` → PASS (`parseSync` resolved).
- `npm ls oxc-parser @oxc-parser/binding-linux-x64-gnu` → PASS (root 0.121.0 and nested 0.127.0 bindings resolved).
- `npm run lint` → PASS (0 errors, 679 existing warnings).
- `npm run packagr` → PASS.
- `npm run build` → PASS.
- `npm run test-ci` → PASS (781/781), but did not activate coverage reporting.
- `npm run build-storybook` → FAIL (`html2canvas` unresolved from `jspdf.es.min.js`; no `oxc-parser` binding error).
- `npx ng test --include='src/app/examples/nav/nav.component.spec.ts' --include='src/app/examples/side-menu/app-side-menu.component.spec.ts' --watch=false --code-coverage=false` → PASS (6/6).
- `npx ng test --include='src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.spec.ts' --watch=false --code-coverage=false` → PASS (17/17).
- `npx ng test --code-coverage --watch=false --reporters=progress --reporters=coverage` → PASS tests (781/781), coverage FAILS policy: 78.04% statements, 68.84% branches, 74.28% functions, 78.54% lines.
- Route/link parity script → PASS (same ordered 16 URLs).
- `git diff --quiet origin/develop/21.0.0 -- public_api.ts src/app/routing.module.ts .storybook .gitlab-ci.yml angular.json src/app/inobeta-ui/ui/kai-table src/app/inobeta-ui/hydration` → PASS (no diff).
