import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromTable from '../reducers/table.reducer';

export const selectTableState = createFeatureSelector<fromTable.IbtableState>(
  fromTable.tableFeatureKey
);

export const ibTableSelectTotalRow = createSelector(
  selectTableState,
  (state: fromTable.IbtableState) => state.totals
);
