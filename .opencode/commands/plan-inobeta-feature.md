---
description: Plan a feature or change in inobeta-ui using the architecture-planner agent
agent: architecture-planner
---

Plan the following change for the inobeta-ui library:

$ARGUMENTS

Before planning, load and follow:

- executor-handoff
- caveman lite

Also load and follow when relevant:

- angular-i18n for UI-visible text
- angular-template-safety for Angular template work
- ngrx-feature-selectors for store work
- cypress-e2e-testing for E2E coverage

Requirements:

- Inspect the existing implementation before planning.
- Split the work across specialized executors.
- Keep each step narrow and independently reviewable.
- Do not provide full code implementations.
- Include executor-ready prompts.
- Keep the final plan compact but complete.

Compression rule:
Use concise wording, but do not omit executor constraints, allowed files, validation steps, risks, or stop conditions.
