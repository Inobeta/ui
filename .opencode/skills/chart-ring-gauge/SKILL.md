---
name: chart-ring-gauge
description: >-
  Apply when working on RingGaugeComponent (ring-gauge.component.ts). Covers the
  SVG-based arc rendering, dashOffset calculation, dynamic colour logic, progress
  clamping, and RingGaugeAdditionalInfo display.
compatibility: opencode
---

## Component Reference

File: `src/app/inobeta-ui/ui/charts/ring-gauge.component.ts`
Selector: `ring-gauge`

## Inputs

| Input | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | `-1` | Numeric value displayed at centre |
| `progress` | `number` | `-1` | Arc fill percentage (0–100); negative triggers empty state |
| `unit` | `string` | `''` | Unit label shown beside the value |
| `icon` | `string \| undefined` | `undefined` | Material icon name shown above the value |
| `iconColor` | `string \| undefined` | `undefined` | CSS colour for the icon |
| `dynamicColor` | `string` | `''` | Stroke colour override; falls back to `#14b8a6` |
| `additionalInfo` | `RingGaugeAdditionalInfo \| null` | `null` | Secondary label+icon row |
| `maxSize` | `string` | `'300px'` | CSS `maxHeight` of the container |

## Data Type (from `types.ts`)

```typescript
RingGaugeAdditionalInfo = { label: string; icon: string; labelColor: string; iconColor: string }
```

## SVG Arc Implementation

- `radius = 57` (fixed); `circumference = 2 * Math.PI * 57 ≈ 358.14`.
- `dashOffset = circumference * (1 - clamp(progress, 0, 100) / 100)` — computed signal.
- The SVG is rotated `-90deg` so 0 % starts at the top.
- Background circle: `stroke: #e5e7eb`, `stroke-width: 2`, `fill: none`.
- Progress circle: `stroke-width: 6`, `stroke-linecap: round`, animated via CSS
  `transition: stroke-dashoffset 0.35s ease, stroke 0.2s ease`.

## Colour Logic

```typescript
effectiveColor = computed(() => this.dynamicColor() || '#14b8a6')
```

Both the progress arc stroke and the value text use `effectiveColor()`.

## Empty State

Shown when `progress() < 0 || value() < 0`. Renders the `.chart-empty` block with a
`donut_large` Material icon instead of the SVG.

## Number Formatting

Value is formatted in the template with:

```html
{{ value() | number:'1.0-2':translate.currentLang ?? 'it' }}
```

Do not move this formatting into the component class — keep it as a template pipe.

## No Chart.js

This component is **pure SVG + Angular**. Do not add `BaseChartDirective`,
`chart.js/auto`, or any ng2-charts import.
