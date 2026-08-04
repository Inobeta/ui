---
name: inobeta-ui-conventions
description: >-
  Apply when working on any file inside src/app/inobeta-ui/. Enforces library-wide
  conventions: naming, barrel imports, peer-dependency bundling, i18n, and public API
  rules. For Angular implementation patterns load inobeta-angular-patterns.
compatibility: opencode
---

## Purpose

This skill captures the conventions that apply to every feature of the **inobeta-ui**
Angular component library. Load it whenever you are about to touch any file inside
`src/app/inobeta-ui/`.

---

## Naming Conventions

| Construct | Pattern | Example |
|---|---|---|
| Classes (components, services, directives) | `Ib` prefix + PascalCase | `IbKaiTableComponent`, `IbToastNotification` |
| Interfaces / types | `Ib` prefix + PascalCase | `IbTableDef`, `IbModalMessage` |
| CSS selectors | `ib-` prefix + kebab-case | `ib-kai-table`, `ib-modal-message` |
| File names | kebab-case + Angular type suffix | `kai-table.component.ts`, `toast.service.ts` |
| Spec stubs | `<feature>.stub.spec.ts` | `toast.service.stub.spec.ts` |
| Barrel files | `index.ts` in each feature folder | `ui/toast/index.ts` |

---

## Public API Rules

- `public_api.ts` is the single library entry point; every publicly exported symbol must
  appear there.
- Removing or renaming an exported symbol is a **breaking change** and requires a major
  version bump.
- Do not touch `public_api.ts` unless explicitly asked to add or remove a public export.

---

## General Forbidden Actions

- Do not perform broad CSS redesigns across the library.
- Do not introduce `any`; prefer explicit types.
- Do not swallow errors silently — log or surface them via the toast service.
