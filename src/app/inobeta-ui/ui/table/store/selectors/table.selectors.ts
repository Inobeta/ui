import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromTable from '../reducers/table.reducer';

export const selectTableState = createFeatureSelector<fromTable.IbTableState>(
  fromTable.ibTableFeatureKey
);

export const ibTableSelectTotalRow = createSelector(
  selectTableState,
  (state: fromTable.IbTableState) => state.totals
);
