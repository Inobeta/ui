import { createSelector, MemoizedSelector, DefaultProjectorFn } from "@ngrx/store";
import { IbKaiTableRecord, IbKaiTableNamedParams } from "./interfaces";
import { IbTableQsParams } from "../../table-url.service";
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

/**
 * @deprecated Maps a canonical record to the legacy `IbKaiTableNamedParams` shape.
 */
const projectorLegacyUrlState = (tableName: string) =>
  (tables: TablesDict): IbKaiTableNamedParams | undefined => {
    const record = tables[tableName];
    if (!record) return undefined;
    return recordToNamedParams(record);
  };

/**
 * @deprecated Maps a legacy record to the old `IbTableQsParams` format.
 */
const projectorLegacyQsRaw = (state?: IbKaiTableNamedParams): IbTableQsParams => ({
  ibfilter: state?.filters as never,
  ibpage: state?.page,
  ibpagesize: state?.pageSize,
  ibaggregatedcolumns: state?.aggregatedColumns,
  ibsort: state?.sort,
  ibview: state?.view,
});

const projectorLegacyQsJson = (state: IbTableQsParams): string => JSON.stringify(state);

// ---------------------------------------------------------------------------
// Extra selectors factory (used by createFeature)
// ---------------------------------------------------------------------------

export const ibKaiTableExtraSelectors = ({ selectTables }: {
  selectTables: MemoizedSelector<object, TablesDict, DefaultProjectorFn<TablesDict>>;
}) => {
  // --- NEW Canonical selectors ---

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

  // --- LEGACY Compatibility selectors ---

  /**
   * @deprecated Use {@link selectIbKaiTableRecord} instead.
   */
  const ibTableSelectUrlState = (tableName: string) =>
    createSelector(selectTables, projectorLegacyUrlState(tableName));

  /**
   * @deprecated Use {@link selectIbKaiTableSnapshot} instead.
   */
  const ibTableSelectLastQueryStringRaw = (tableName: string) =>
    createSelector(
      ibTableSelectUrlState(tableName),
      projectorLegacyQsRaw,
    );

  /**
   * @deprecated Use {@link selectIbKaiTableSnapshot} instead.
   */
  const ibTableSelectLastQueryString = (tableName: string) =>
    createSelector(
      ibTableSelectLastQueryStringRaw(tableName),
      projectorLegacyQsJson,
    );

  return {
    // New canonical
    selectIbKaiTableRecord,
    selectIbKaiTableSnapshot,
    selectTableSort,
    selectTableFilters,
    selectTablePageIndex,
    selectTablePageSize,
    selectTableSelectedView,
    selectTableAggregatedColumns,
    selectTableInitialized,
    // Legacy compat
    ibTableSelectUrlState,
    ibTableSelectLastQueryStringRaw,
    ibTableSelectLastQueryString,
  };
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Maps a canonical `IbKaiTableRecord` to the legacy
 * `IbKaiTableNamedParams` shape for backward compatibility.
 */
function recordToNamedParams(record: IbKaiTableRecord): IbKaiTableNamedParams {
  return {
    tableName: record.tableName,
    view: record.selectedView ?? undefined,
    page: record.pageIndex,
    pageSize: record.pageSize,
    // Legacy consumers used IbFilterSyntaxExtended — this cast is intentional.
    filters: record.filters as never,
    aggregatedColumns: record.aggregatedColumns,
    sort: record.sort ?? { active: '', direction: '' },
  };
}
