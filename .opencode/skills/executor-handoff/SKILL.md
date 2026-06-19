---
name: executor-handoff
description: Use when an architecture planner must produce executor-ready implementation steps for specialized executor agents.
compatibility: opencode
---

## Purpose

Generate implementation steps that can be copied directly into a specialized executor agent.

## Step Output Format

For each implementation step, provide:

1. Step Title
2. Target Executor
3. Allowed Files
4. Read-only Reference Files
5. Objective
6. Required Changes
7. Constraints
8. Validation
9. Stop Condition
10. Executor Input

## Rules

- Assign each step to exactly one executor.
- Do not assign mixed-responsibility tasks if they can be split.
- Prefer the most specialized executor.
- Do not mix application implementation and Jasmine/Karma coverage in the same step if they can be split.
- Executor instructions must be specific and constrained.
- Do not provide full code implementations.
- Include only small snippets when strictly necessary for clarity.
- Each step must be independently reviewable and testable.

## Executor prompt format (strict)

Each step prompt must follow this exact schema. Simpler models work better with schematic prompts. Use a tilde fence for the outer block (~~~); internal code blocks use backticks (```).

```
## TASK:
[brief description]

## CONTEXT:
[repo, file, current state]

## OBJECTIVE:
[clear final result]

## REQUIREMENTS:
[numbered list, concrete]

## CONSTRAINTS:
[what NOT to do]

## OUTPUT:
[what must be returned]

## ACCEPTANCE CRITERIA:
[verifiable conditions]

## IF UNSURE:
write "NEED CLARIFICATION" and take no action
```

Acceptance criteria must be machine/verifiable where possible. Good examples:

- `npm run build` completes without errors.
- `grep -r "<added_content>" <file_path>` has at least one match.

Avoid vague acceptance criteria such as:

- "The code works."
- "The UI is usable."
- "The component is well written."
