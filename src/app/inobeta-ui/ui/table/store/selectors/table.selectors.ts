import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromTable from '../reducers/table.reducer';

export const selectTableState = createFeatureSelector<fromTable.IbTableState>(
  fromTable.ibTableFeatureKey
);

export const ibTableSelectTotalRow = (tableName) => createSelector(
  selectTableState,
  (state: fromTable.IbTableState) => state?.instances?.find(i => i.tableName === tableName)?.config?.totals
);

export const ibTableSelectFilters = (tableName) => createSelector(
  selectTableState,
  (state: fromTable.IbTableState) => state?.instances?.find(i => i.tableName === tableName)?.config?.filters
);

export const ibTableSelectPaginator = (tableName) => createSelector(
  selectTableState,
  (state: fromTable.IbTableState) => state?.instances?.find(i => i.tableName === tableName)?.config?.paginator
);

export const ibTableSelectSort = (tableName) => createSelector(
  selectTableState,
  (state: fromTable.IbTableState) => state?.instances?.find(i => i.tableName === tableName)?.config?.sort
);

export const ibTableCurrentConfSelector = createSelector(
  selectTableState,
  (state: fromTable.IbTableState) => state?.selectedConfig
);
