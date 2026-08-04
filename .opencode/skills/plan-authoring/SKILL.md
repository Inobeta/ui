---
name: plan-authoring
description: Use when writing or updating a plan or feedback document under docs/plans/ that agents-runner will parse and execute. Pins the canonical document dialect so units, executors, models and prompts are extracted unambiguously.
compatibility: opencode
---

## Purpose

Documents in `docs/plans/` are not only read by people: `agents-runner` parses them to
list units, resolve an agent and a model, and send a prompt to an executor. Ambiguity
in the document becomes a wrong model, a missing prompt, or a unit that never appears
in the UI.

The parser is deliberately tolerant and still accepts the older dialects. This skill
defines the **canonical form for new documents**, so tolerance never has to grow further.

## Unit headings

```
### Step 3 — Short imperative title
### Step 12.1 — Title of an inserted step
### Remediation 2 — Title of a review fix
```

- Level 3 (`###`), inside the `## 5. Step-by-Step Plan` section.
- Separator is an em-dash `—` surrounded by single spaces.
- Ids are numeric and dotted (`3`, `12.1`). Insert between 2 and 3 as `2.1`; never
  renumber existing steps, ids are historical references.
- Remediation ids are plain integers; the parser exposes them as `R1`, `R2`.
- Nothing else on the heading line except the done marker (below).

## Done marker

Append to the **end** of the heading, nothing after it:

```
### Step 3 — Short imperative title ✅ DONE
```

Do not put the marker between the id and the separator (`### Step 3 [DONE] — Title`).
That form exists in older plans and is still parsed, but it is not canonical.

## Metadata block

One bullet per key, at column 0, immediately under the heading:

```
- **Executor**: `backend-engineer`
- **Model**: `opencode/claude-sonnet-5`
- **File consentiti**: `src/parser/unit.ts`, `src/parser/plan.ts`
- **File di riferimento**: `src/domain/types.ts`
- **Obiettivo**: one sentence stating the end state.
- **Requisiti**:
  1. First concrete requirement.
  2. Second concrete requirement.
- **Vincoli**: what must not be touched or changed.
- **Validazione**: `npm run check`
- **Stop condition**: when to stop and report instead of guessing.
```

Rules that matter to the parser:

- **Keys start at column 0** (a leading `- ` is fine). A bold phrase indented deeper
  than three spaces is treated as prose, not as a key — which is what you want for
  emphasis inside a list item, and what you must avoid for a real key.
- **Always wrap models and file paths in backticks.** A bare model name is accepted
  only as a short fallback; a backticked one is unambiguous.
- **File lists**: backticked paths separated by `,` or `;`. Every entry needs a `/`
  or a file extension, otherwise it is prose and gets dropped. Write
  `` `api/migrations/` `` , not "a new migration under api".
- Both English and Italian key names are recognized (`Executor`/`Esecutore`,
  `Allowed files`/`File consentiti`, …). Pick one language per document.

### Capability groups

When routing by capability instead of a fixed model:

```
- **Modelli suggeriti**: gruppo R — `opencode/claude-opus-5`, `opencode/gpt-5.6-terra`
```

The group letter and the backticked candidates are both extracted. Candidates must be
ids that actually exist in `opencode models`.

## Prompt

Introduce the prompt with a label, then a tilde fence. The label must contain
`Executor Input`, `Executor handoff`, or `Prompt`:

```
**Executor Input**:

~~~
## TASK:
...
## IF UNSURE:
write "NEED CLARIFICATION" and take no action
~~~
```

- **Outer fence is `~~~`; inner code blocks use backticks.** The prompt body contains
  `## TASK:` headings, which are only safe because the fence makes them opaque.
- Exactly one prompt fence per unit. Without a label the parser falls back to the
  longest fence in the unit, which is a guess — always label it.
- The prompt body follows the `executor-handoff` skill's schema.

## Dependencies

One subsection inside the step plan, before the first unit:

```
### Dependencies between steps

`1 → 2 → 2.1`; `3 → 4`; `1+3 → 5`
```

- `→` is precedence, `+` means several prerequisites, `;` separates chains.
- Use only real unit ids. Natural-language operands ("once everything is tested") are
  ignored with a warning, so encode the real dependency or leave it out.
- Omit the section entirely to mean strictly sequential order.

## Feedback documents

Named `<plan-slug>-feedback.md`. Required sections:

```
## References
- Original plan: `docs/plans/<plan-slug>.md`.
- Branch reviewed: `<branch>` vs `<base>`.
- Review date: `<YYYY-MM-DD>`.

## Verdict
**FAIL**

## Reviewed steps
### Step 25 — Original title
- **Issues found**:
  - `[BLOCKER]` Description (`file.ts:78,125`). Impact: … Recommendation: …

## Remediation plan
### Remediation 1 — Title [agent: kai-table-executor] [model: `opencode/gpt-5.6-sol`]
```

- Verdict is `PASS` or `FAIL` in bold, on its own line.
- Severity is one of `[BLOCKER]`, `[WARNING]`, `[NIT]`, at the start of the bullet.
- File references go in backticks as `path:lines`.
- Remediation headings carry `[agent: …]` and `[model: …]` inline; they are lifted out
  of the title. Remediations are executable units and need a prompt fence.

## Before saving, verify

- Every unit heading matches `### Step <id> — <title>` or `### Remediation <n> — <title>`.
- Every unit declares an executor and exactly one labelled prompt fence.
- Every model and every file path is backticked.
- No metadata key is indented more than three spaces.
- The dependency section, if present, references only existing ids.
- Step ids are unique; inserted steps use a dotted id rather than a renumbering.

## Do NOT do

- Do not renumber or reorder existing steps.
- Do not put two prompt fences in one unit.
- Do not write file lists as prose.
- Do not invent model ids; check them against `opencode models`.
