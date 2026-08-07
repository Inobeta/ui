import { createSelector, MemoizedSelector, DefaultProjectorFn } from "@ngrx/store";
import { IbKaiTableRecord } from "./interfaces";
import { IbKaiTableSnapshot } from "../../table.types";

// ---------------------------------------------------------------------------
// Projector functions (pure — no NgRx dependency)
// ---------------------------------------------------------------------------

type TablesDict = Record<string, IbKaiTableRecord>;

const projectorRecordByTableName = (tableName: string) =>
  (tables: TablesDict): IbKaiTableRecord | undefined =>
    tables[tableName];

const projectorSnapshotFromRecord = (record?: IbKaiTableRecord): IbKaiTableSnapshot | undefined =>
  record ? {
    sort: record.sort,
    filters: record.filters,
    selectedView: record.selectedView,
    pageIndex: record.pageIndex,
    pageSize: record.pageSize,
    aggregatedColumns: record.aggregatedColumns,
  } : undefined;

// ---------------------------------------------------------------------------
// Extra selectors factory (used by createFeature)
// ---------------------------------------------------------------------------

export const ibKaiTableExtraSelectors = ({ selectTables }: {
  selectTables: MemoizedSelector<object, TablesDict, DefaultProjectorFn<TablesDict>>;
}) => {
  /** Select a single `IbKaiTableRecord` by `tableName`. */
  const selectIbKaiTableRecord = (tableName: string) =>
    createSelector(selectTables, projectorRecordByTableName(tableName));

  /** Select an `IbKaiTableSnapshot` by `tableName`. */
  const selectIbKaiTableSnapshot = (tableName: string) =>
    createSelector(selectIbKaiTableRecord(tableName), projectorSnapshotFromRecord);

  // Granular selectors

  const selectTableSort = (tableName: string) =>
    createSelector(selectIbKaiTableRecord(tableName), (r) => r?.sort ?? null);

  const selectTableFilters = (tableName: string) =>
    createSelector(selectIbKaiTableRecord(tableName), (r) => r?.filters ?? null);

  const selectTablePageIndex = (tableName: string) =>
    createSelector(selectIbKaiTableRecord(tableName), (r) => r?.pageIndex ?? 0);

  const selectTablePageSize = (tableName: string) =>
    createSelector(selectIbKaiTableRecord(tableName), (r) => r?.pageSize ?? 20);

  const selectTableSelectedView = (tableName: string) =>
    createSelector(selectIbKaiTableRecord(tableName), (r) => r?.selectedView ?? null);

  const selectTableAggregatedColumns = (tableName: string) =>
    createSelector(selectIbKaiTableRecord(tableName), (r) => r?.aggregatedColumns ?? {});

  const selectTableInitialized = (tableName: string) =>
    createSelector(selectIbKaiTableRecord(tableName), (r) => r?.initialized ?? false);

  return {
    selectIbKaiTableRecord,
    selectIbKaiTableSnapshot,
    selectTableSort,
    selectTableFilters,
    selectTablePageIndex,
    selectTablePageSize,
    selectTableSelectedView,
    selectTableAggregatedColumns,
    selectTableInitialized,
  };
};
