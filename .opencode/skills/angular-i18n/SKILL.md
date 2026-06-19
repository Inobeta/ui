---
name: angular-i18n
description: Use when adding or modifying user-visible text, UI metadata, labels, buttons, messages, dialogs, forms, tables, cards, wizard steps, or configuration consumed by Angular UI.
compatibility: opencode
---

## Mandatory Rules

- Never hardcode user-facing strings in Angular templates or components.
- All visible text in templates must use `TranslatePipe`.
- If conditional logic is needed, compute the translation key in TypeScript and bind that key in the template.
- Do not call translation services directly inside templates.
- Every new visible string must have a corresponding translation key.
- Update `src/assets/i18n/it.json` when new keys are introduced.
- Add only the required keys.
- Do not modify unrelated translations.

## Runtime / Metadata Rules

If introducing data that will be rendered as visible UI text:
- use translation keys instead of raw labels
- do not return hardcoded Italian or English labels meant to be displayed directly
- keep the UI responsible for translating keys

## Translation Key Naming

Prefer hierarchical keys such as:
- `common.*`
- `wizard.*`
- `generateFeature.*`

Avoid vague keys such as:
- `text1`
- `label1`
- `button1`

## Review Checklist

Check for:
- hardcoded strings in `.html`
- hardcoded labels in `.ts` returned to templates
- new keys missing from `src/assets/i18n/it.json`
- vague or inconsistent key names
- unrelated translation edits
