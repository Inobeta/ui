---
description: Execute a focused Karma/Jasmine unit test step inside inobeta-ui
agent: unit-jasmine-executor
---

Execute this unit test step:

$ARGUMENTS

Constraints:
- Modify only spec files (*.spec.ts, *.stub.spec.ts) and their co-located source
  when a compilation fix is strictly required.
- Do not touch src/app/examples/.
- Do not alter production logic to make a test pass.
- Stop when the step is complete.
