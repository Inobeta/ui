
# DEVK-1106 — Correct HTTP and Forms deprecation timelines — Manual review remediation

## References

- Original plan: `devk-1106-align-storybook-documentation-and-present-the-v20-release`.
- Review date: `2026-08-04`.
- Source: manual validation by the user.

## Verdict

**FAIL**

Manual review found incorrect v21 removal annotations across HTTP, Forms, and Material Forms; the user confirmed a requirement change establishing migration scripts no earlier than v22, without runtime changes. All original-plan requirements unrelated to this lifecycle correction remain valid.

## Manual review summary

The user found multiple statements saying deprecated HTTP and Forms APIs will be removed in v21. They expect v21 removal to apply only to Main Menu and Breadcrumbs. HTTP, Forms, and Material Forms must remain deprecated, with comments stating that migration scripts toward Angular core APIs and Formly are planned no earlier than v22. The requested remediation is limited to source-code comments and must not alter runtime behavior or Markdown/MDX documentation.

## Reviewed steps

### Step 6 — Align HTTP documentation and stories

- **Original plan state**: `[DONE]`
- **Reported behaviour**: HTTP source annotations repeatedly state that APIs will be removed in v21.
- **Expected behaviour**: HTTP APIs remain deprecated, but comments state that migration scripts toward Angular core APIs are planned no earlier than v22.
- **Classification**: `requirement change`
- **Issues found**:
  - `[BLOCKER]` Twenty HTTP deprecation annotations promise removal in v21 instead of the newly confirmed migration timeline (`src/app/inobeta-ui/http/http.module.ts:89`, `src/app/inobeta-ui/http/auth/login.service.ts:19`, `src/app/inobeta-ui/http/auth/session.model.ts:1,7,13,18`, `src/app/inobeta-ui/http/auth/guard.service.ts:30`, `src/app/inobeta-ui/http/store/index.ts:20,34,45`, `src/app/inobeta-ui/http/http/loader.interceptor.ts:14`, `src/app/inobeta-ui/http/http/messages.decorator.ts:22`, `src/app/inobeta-ui/http/http/response-handler.service.ts:10`, `src/app/inobeta-ui/http/http/loading-skeleton.directive.ts:27`, `src/app/inobeta-ui/http/http/error.interceptor.ts:9`, `src/app/inobeta-ui/http/http/spinner-loading.component.ts:76`, `src/app/inobeta-ui/http/http/loading-skeleton-container.component.ts:29`, `src/app/inobeta-ui/http/http/loading-skeleton.component.ts:21`, `src/app/inobeta-ui/http/http/auth.interceptor.ts:12`, `src/app/inobeta-ui/http/http/role-check.directive.ts:18`). Impact: generated API guidance communicates an obsolete removal deadline for all affected HTTP consumers. Recommendation: preserve `@deprecated`, replace only the lifecycle sentence, and make no executable-code changes.
  - `[WARNING]` Existing HTTP MDX still repeats the v21 deadline (`src/app/inobeta-ui/http/http.mdx:9,53,91,108,122,189`, `src/app/inobeta-ui/http/http-api.mdx:7`, `src/app/inobeta-ui/http/auth/login.service.mdx:10-11`). Impact: source comments and narrative documentation will disagree after remediation. Recommendation: record for a later documentation review; these files remain excluded because the user explicitly limited this remediation to code comments.

### Step 7 — Correct deprecated UI feature documentation

- **Original plan state**: `[DONE]`
- **Reported behaviour**: Material Forms source metadata says removal will occur in v21.
- **Expected behaviour**: Material Forms remains deprecated, with a comment stating that migration scripts toward Formly are planned no earlier than v22.
- **Classification**: `requirement change`
- **Issues found**:
  - `[BLOCKER]` Material Forms still carries the superseded v21 removal annotation (`src/app/inobeta-ui/ui/material-forms/material-form.module.ts:100`). Impact: consumers see a removal deadline that is no longer intended. Recommendation: update only the JSDoc lifecycle wording and preserve module behavior and deprecation status.

### Step 9 — Correct attached consumer Markdown

- **Original plan state**: `[DONE]`
- **Reported behaviour**: Legacy Forms source annotations state removal in v21.
- **Expected behaviour**: Forms remains deprecated, with comments stating that migration scripts toward Formly are planned no earlier than v22.
- **Classification**: `requirement change`
- **Issues found**:
  - `[BLOCKER]` Three legacy Forms declarations retain the superseded v21 removal annotation (`src/app/inobeta-ui/ui/forms/forms.module.ts:25`, `src/app/inobeta-ui/ui/forms/form-control.service.ts:13`, `src/app/inobeta-ui/ui/forms/dynamic-form-control/dynamic-form-control.component.ts:13`). Impact: consumers receive incorrect lifecycle information through source and generated API documentation. Recommendation: update only these JSDoc comments.
  - `[WARNING]` The attached Forms guide still states that both legacy Forms modules will be removed in v21 (`src/app/inobeta-ui/ui/forms/forms.module.md:5`). Impact: the guide will conflict with corrected source metadata. Recommendation: defer correction because Markdown was explicitly excluded from this remediation.

## Confirmed requirement changes

### Change 1 — Defer HTTP and Forms migration timeline

- **Original requirement**: Step 6 required source-backed deprecation and removal information; Step 7 required Material Forms wording to follow source metadata without inventing a removal version; Step 9 required legacy Forms deprecation wording to match current source metadata.
- **New behaviour required**: Only Main Menu and Breadcrumbs are planned for removal in v21. All deprecated HTTP, Forms, and Material Forms source comments must instead state that migration scripts toward Angular core APIs or Formly are planned no earlier than v22. Runtime behavior must remain unchanged.
- **Nature of the contradiction**: Existing source metadata fixes removal at v21, while the confirmed replacement requirement rejects that deadline and introduces a later migration-script timeline. Both lifecycle claims cannot remain authoritative.
- **Confirmed by the user**: “Si confermo, in realtà mi aspetto che modifichi solo i commenti al codice e non l'operatività del codice stesso”; scope confirmed with “1 si per i form. Idem per http, tutto quanto” and wording accepted with “2. Si va bene quel commento”.
- **Parts of the original plan this invalidates**: Step 6 requirement 2 and its source-metadata acceptance criterion; Step 7 requirement 3; Step 9 requirement 5 and its source-metadata acceptance criterion.

## Impact analysis

- **Other steps of the original plan**: Steps 6, 7, and 9 are affected only where their documentation requirements relied on the old source metadata. Steps 1–5 and 8 are not affected. Main Menu and Breadcrumbs retain their confirmed v21 removal wording.
- **Components that depend on the changed behaviour**: Not affected. Only JSDoc comments change.
- **Application state, contracts between modules, API surface, persistence**: Not affected. No symbol, selector, input, output, provider, state key, storage behavior, or runtime contract changes.
- **Backward compatibility**: Preserved. Deprecated APIs remain available and behave exactly as before.
- **Automated tests and validations that assert the old behaviour**: No runtime regression test applies to comment-only changes. A repository text check must ensure no scoped TypeScript annotation still promises v21 removal; `npm run lint` must continue to pass.
- **Documentation**: Generated documentation derived from JSDoc changes. Existing MDX and Markdown pages remain unchanged under the user-confirmed scope, leaving known lifecycle inconsistencies listed as warnings.
- **Already-implemented features that keep working**: All HTTP, authentication, loading, Forms, and Material Forms functionality must continue unchanged. All unrelated DEVK-1106 corrections remain valid.
- **Size of change**: Wider than a single misplaced sentence: the same annotation occurs 24 times across 19 TypeScript files. The work remains mechanically small because only comments are permitted.

## Assumptions

- None.

## Remediation plan

### Remediation 1 — Correct all HTTP deprecation comments [agent: task-executor] [model: openai/gpt-5.6-sol] ✅ DONE [2026-08-04T16:04:21.471Z]

- **Dipendenze**: none.
- **File consentiti**: `src/app/inobeta-ui/http/http.module.ts`, `src/app/inobeta-ui/http/auth/login.service.ts`, `src/app/inobeta-ui/http/auth/session.model.ts`, `src/app/inobeta-ui/http/auth/guard.service.ts`, `src/app/inobeta-ui/http/store/index.ts`, `src/app/inobeta-ui/http/http/loader.interceptor.ts`, `src/app/inobeta-ui/http/http/messages.decorator.ts`, `src/app/inobeta-ui/http/http/response-handler.service.ts`, `src/app/inobeta-ui/http/http/loading-skeleton.directive.ts`, `src/app/inobeta-ui/http/http/error.interceptor.ts`, `src/app/inobeta-ui/http/http/spinner-loading.component.ts`, `src/app/inobeta-ui/http/http/loading-skeleton-container.component.ts`, `src/app/inobeta-ui/http/http/loading-skeleton.component.ts`, `src/app/inobeta-ui/http/http/auth.interceptor.ts`, `src/app/inobeta-ui/http/http/role-check.directive.ts`
- **Origine**: `requirement change (Change 1)`

**Prompt**:

~~~
## TASK:
Replace every HTTP source comment that promises removal in v21 with the confirmed migration-script timeline.

## CONTEXT:
DEVK-1106 Step 6 required HTTP documentation to follow source-backed deprecation metadata. Manual review established that the current `@deprecated this element will be removed in v21` annotations across the allowed HTTP files no longer describe the intended lifecycle. Only Main Menu and Breadcrumbs are confirmed for v21 removal.

## OBJECTIVE:
Keep every affected HTTP API deprecated while stating that migration scripts toward Angular core APIs are planned no earlier than v22.

## REQUIREMENTS:
1. Update all 20 affected `@deprecated` annotations in the allowed files.
2. Preserve the `@deprecated` tag and use one consistent English lifecycle sentence.
3. State that migration scripts toward Angular core APIs are planned no earlier than v22; do not promise removal in v22.
4. Change comments only. Do not alter imports, declarations, decorators, providers, methods, templates, exports, or runtime behavior.
5. No runtime regression test is required for comment-only changes. Use a static repository check to prove that no scoped TypeScript comment still says `removed in v21`.

## CONSTRAINTS:
- Do not modify Markdown, MDX, stories, tests, public exports, or the original plan.
- Do not change Main Menu or Breadcrumb annotations.
- Do not remove deprecation status.
- Preserve every unrelated requirement and completed correction from DEVK-1106.
- No refactoring or formatting unrelated lines.

## OUTPUT:
Report every changed file, the final standardized wording, confirmation that only comments changed, and validation results.

## ACCEPTANCE CRITERIA:
- `npm run lint` passes.
- `rg "v21|removed in v21" src/app/inobeta-ui/http -g "*.ts"` returns no affected HTTP deprecation annotation.
- `git diff --check -- src/app/inobeta-ui/http` reports no errors.
- The diff contains comment-only changes and no runtime-code changes.
- All affected APIs remain marked `@deprecated`.
- Comments describe migration scripts toward Angular core APIs as planned no earlier than v22 without promising a v22 removal.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~

### Remediation 2 — Correct all Forms deprecation comments [agent: task-executor] [model: openai/gpt-5.6-sol] ✅ DONE [2026-08-04T16:05:22.202Z]

- **Dipendenze**: none; may run independently of Remediation 1.
- **File consentiti**: `src/app/inobeta-ui/ui/forms/forms.module.ts`, `src/app/inobeta-ui/ui/forms/form-control.service.ts`, `src/app/inobeta-ui/ui/forms/dynamic-form-control/dynamic-form-control.component.ts`, `src/app/inobeta-ui/ui/material-forms/material-form.module.ts`
- **Origine**: `requirement change (Change 1)`

**Prompt**:

~~~
## TASK:
Replace every Forms and Material Forms source comment that promises removal in v21 with the confirmed migration-script timeline.

## CONTEXT:
DEVK-1106 Steps 7 and 9 required Forms documentation to follow source-backed deprecation metadata. Manual review established that the four current `@deprecated this element will be removed in v21` annotations in the allowed files no longer describe the intended lifecycle.

## OBJECTIVE:
Keep all affected Forms and Material Forms APIs deprecated while stating that migration scripts toward Formly are planned no earlier than v22.

## REQUIREMENTS:
1. Update the four affected `@deprecated` annotations in the allowed files.
2. Preserve the `@deprecated` tag and use one consistent English lifecycle sentence.
3. State that migration scripts toward Formly are planned no earlier than v22; do not promise removal in v22.
4. Change comments only. Do not alter modules, components, services, selectors, declarations, imports, exports, or runtime behavior.
5. No runtime regression test is required for comment-only changes. Use a static repository check to prove that no scoped TypeScript comment still says `removed in v21`.

## CONSTRAINTS:
- Do not modify Markdown, MDX, stories, tests, public exports, or the original plan.
- Do not change Main Menu or Breadcrumb annotations.
- Do not remove deprecation status.
- Preserve every unrelated requirement and completed correction from DEVK-1106.
- No refactoring or formatting unrelated lines.

## OUTPUT:
Report every changed file, the final standardized wording, confirmation that only comments changed, and validation results.

## ACCEPTANCE CRITERIA:
- `npm run lint` passes.
- `rg "v21|removed in v21" src/app/inobeta-ui/ui/forms src/app/inobeta-ui/ui/material-forms -g "*.ts"` returns no affected Forms deprecation annotation.
- `git diff --check -- src/app/inobeta-ui/ui/forms src/app/inobeta-ui/ui/material-forms` reports no errors.
- The diff contains comment-only changes and no runtime-code changes.
- All affected APIs remain marked `@deprecated`.
- Comments describe migration scripts toward Formly as planned no earlier than v22 without promising a v22 removal.

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~
PLAN>>>
