---
name: chart-single-value
description: >-
  Apply when working on SingleValueComponent (single-value.component.ts). Covers the
  four layout variants (header, stacked, inline, side-icon), their structural differences,
  SingleValueAdditionalInfo, digitsInfo formatting, and the SingleValueVariant enum.
compatibility: opencode
---

## Component Reference

Files:
- `src/app/inobeta-ui/ui/charts/single-value.component.ts`
- `src/app/inobeta-ui/ui/charts/single-value.component.scss`

Selector: `single-value`

## Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | required | Numeric value to display |
| `icon` | `string` | required | Material icon name |
| `variant` | `'header' \| 'stacked' \| 'inline' \| 'side-icon'` | `'header'` | Layout variant |
| `title` | `string` | `'title'` | Label shown in supported variants |
| `unit` | `string` | `''` | Unit appended to the value |
| `digitsInfo` | `string` | `'1.2-2'` | Angular `DecimalPipe` digits format string |
| `iconColor` | `string` | `'auto'` | CSS colour for the main icon |
| `backgroundColor` | `string` | `'auto'` | Container background colour |
| `fontColor` | `string \| null` | `null` | Container text colour |
| `additionalInfo` | `SingleValueAdditionalInfo \| null` | `undefined` | Secondary label+icon |

## Data Type (from `types.ts`)

```typescript
SingleValueAdditionalInfo = { label: string; icon: string; labelColor: string; iconColor: string }
```

## Variant Layout Rules

Each variant is an independent `@if` block in the template — they do **not** share a
wrapper element. Keep this structure; do not refactor into a single conditional class.

| Variant | Title | Icon position | Value size | additionalInfo |
|---|---|---|---|---|
| `header` | Top-left (xl) | Left of title row | `5xl` | Below title |
| `stacked` | No title | Above value | `3xl` | Below value |
| `inline` | Inline beside icon (md) | Left | `3xl` | Not shown |
| `side-icon` | Side content (xl) | Left column | `2xl` | Below title |

## Number Formatting

Value is formatted in the template using `DecimalPipe`:

```html
{{ value() | number:digitsInfo():(translate.currentLang ?? 'it') }}
```

`digitsInfo` is itself an `input()` signal so the format is consumer-controlled.
Do not hard-code `'1.2-2'` inside the template.

## SingleValueVariant Enum

The enum is **file-private** (no `export`). The default for the `variant` input uses
`SingleValueVariant.HEADER`. Do not export the enum or move it to `types.ts`.

## Styling

Styles live in `single-value.component.scss` (external file). BEM-style class names:
`.single-value`, `.single-value--{variant}`, `.single-value__{element}`,
`.single-value__{element}--{modifier}`. Do not inline styles into the component decorator.

## No Chart.js

This component is **pure Angular + Material Icons**. Do not add `BaseChartDirective`,
`chart.js/auto`, or any ng2-charts import.
