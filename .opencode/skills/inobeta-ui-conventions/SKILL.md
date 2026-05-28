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

For Angular component/service patterns (lifecycle, signals, NgModule setup, template
discipline, error handling) load **`inobeta-angular-patterns`** in addition.

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

## Import Rules

- Always import from the **barrel** (`index.ts`) of a feature folder; never from internal
  files directly.
- Group imports: Angular core → Angular libs → third-party → internal (barrel).
- Peer dependencies (`rxjs`, `@ngrx/*`, `ngx-translate`, `@angular/material`) must **not**
  be bundled — keep them as `peerDependencies` in `package.json`.

---

## i18n Rules

- Never hard-code user-facing strings in templates or TypeScript.
- All visible text in templates must go through `TranslatePipe`.
- Add new translation keys to `translations.ts` in the relevant feature folder **and** to
  every i18n JSON file consumed by the library.
- Prefer hierarchical key names (`table.noData`, `table.loading`) over vague keys
  (`text1`, `label1`).
- Do not modify unrelated translation keys.

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
- Do not work on demo/example app files (`src/app/examples/`) unless a test fixture
  explicitly requires it.
- Do not introduce `any`; prefer explicit types.
- Do not swallow errors silently — log or surface them via the toast service.
