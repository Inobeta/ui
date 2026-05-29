---
name: focused-execution
description: Use when implementing any narrow code change in an existing codebase. Enforces minimal scope, no unrelated refactors, allowed-file discipline, and stop conditions.
compatibility: opencode
---

## Purpose

Apply this skill when executing a single implementation step inside an existing codebase.

## Execution Rules

- Implement only the requested step.
- Do not expand scope.
- Do not anticipate future changes unless explicitly requested.
- Do not perform unrelated refactors.
- Preserve current architecture unless the task explicitly changes it.
- Prefer minimal and local modifications.
- Touch as few files as reasonably possible.
- Avoid cascading changes unless required.
- Do not silently change APIs, contracts, or behavior outside the requested scope.
- If the task is ambiguous, make the smallest reasonable assumption and state it clearly.
- If the task cannot be completed safely without broader changes, say so explicitly.
- If the task is larger than a single step, say it should be split before execution.
- If modifying files outside the allowed scope is required, stop and report them instead of editing them.
- Do not fix unrelated files even if they contain errors.
- Stop once the requested step is complete.

## Output

Return:
1. Implemented Scope
   - what was done

2. Files Changed
   - list of modified files
   - short reason for each

3. Summary of Changes
   - concise explanation of the implementation

4. Assumptions
   - any assumptions made during implementation

5. Follow-up Checks
   - what should be reviewed or tested next
