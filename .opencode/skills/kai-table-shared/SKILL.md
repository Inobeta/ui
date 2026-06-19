---
name: kai-table-shared
description: >-
  Shared architecture and contract information for the kai-table feature.
  Provide this skill to any agent working on `ui/kai-table` or `ui/kai-table-mobile` so
  they understand the cross-cutting flows and integration points. This file contains
  patterns and data-flow guidance only — no code samples or implementation edits.
compatibility: opencode
---

## Purpose

This skill captures the fundamental architecture and public contracts shared by the
desktop table (`IbKaiTable`) and the mobile rendering layer (`IbKaiTableMobile`). Load
it whenever a task touches either folder.

## Shared contracts and patterns

- Columns registration: each `IbColumn` instance self-registers with the parent table
  via the `IB_TABLE` injection token. Columns expose typed accessors for display,
  sorting and filtering; consumers should not bypass these accessors.

- Mobile rendering contract: every `IbColumn` exposes a `mobileDataRenderer()` method
  (or equivalent contract) that returns a representation suitable for card-style
  rendering. New column types must implement this contract to ensure parity on mobile.

- Data source connection: the mobile component consumes the same `IbTableDataSource`
  stream as the desktop table (via `connect()`), not a separate store slice. Filtering,
  sorting and pagination logic live in the data source pipeline and are shared.

- Sort and filter propagation: user interactions on mobile (toolbar) propagate to
  the desktop pipeline by invoking the table's public sort/filter API. Do not create
  a parallel sort state in the mobile layer — use the existing propagation path.

- URL state and NgRx: table UI changes dispatch `urlStateActions` which are handled by
  side-effects that serialize the table state into the URL query string. This provides
  deep-linking and history. Implementation changes to how state is written/read must
  preserve the namespace per `tableName` and the serialization format unless a migration
  plan is agreed.

- Data source types: prefer `IbTableDataSource` for client-side processing and
  `IbTableRemoteDataSource` for server-driven datasets. The remote data source intentionally
  short-circuits local filtering — agents must not reintroduce client-side filtering
  for remote mode without changing the contract and validating compatibility.

- DI tokens and multi-providers: the table feature exposes tokens such as `IB_TABLE`,
  `IB_COLUMN`, `IB_AGGREGATE`, and `IB_AGGREGATE_TYPE`. Understand provider roles before
  changing providers scope — a wrong provider scope breaks column registration and
  aggregation discovery.

## Where to look (source of truth)

- Desktop entry: `src/app/inobeta-ui/ui/kai-table/table.component.ts`
- Column base and subclasses: `src/app/inobeta-ui/ui/kai-table/columns/`
- Data sources: `src/app/inobeta-ui/ui/kai-table/table-data-source.ts`
- Remote data source: `src/app/inobeta-ui/ui/kai-table/remote-data-source.ts`
- Mobile entry: `src/app/inobeta-ui/ui/kai-table-mobile/table-mobile.component.ts`
- Shared types: `src/app/inobeta-ui/ui/kai-table/table.types.ts`
- URL state and store: `src/app/inobeta-ui/ui/kai-table/store/` and `table-url.service.ts`

## Guidance for changes (do / don't)

- Do preserve the column accessors and mobile rendering contract when adding new
  column types or changing column behavior.
- Do use the existing data source pipeline for shared logic; prefer extension points
  rather than duplicating pipelines.
- Do keep mobile UI stateless with respect to sorting/filtering — delegate to the
  table's public APIs so the canonical state remains in the data source and URL.
- Don't introduce a separate NgRx slice for mobile-only state that mirrors the table
  state; prefer ephemeral component-level signals for purely visual concerns.
- Don't change the URL serialization format without a documented migration plan.

## When to escalate

- If a requested change requires adding a new public API on the table (new token,
  exported type, or different URL schema), mark the task as multi-step and escalate
  to the architecture planner — this is a breaking-scope change.
