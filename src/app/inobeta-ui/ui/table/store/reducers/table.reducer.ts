import { createReducer, on } from '@ngrx/store';
import * as TableActions from '../actions/table.actions';

export const tableFeatureKey = 'ibTable';

export interface IbTableFilterState {

}

export interface IbTableSortState {

}

export interface IbTableTotalRowState {
  columnName: string;
  component: any;
}

export interface IbtableState {
  filters: IbTableFilterState[];
  totals: IbTableTotalRowState[];
  sort: IbTableSortState;
}

export const initialState: IbtableState = {
  filters: [],
  totals: [],
  sort: {},
};


export const reducer = createReducer(
  initialState,

  on(TableActions.ibTableActionSetTotalRowCell,
    (state, newTotalRowState) => {
      const rowExists = state.totals.find(t => t.columnName === newTotalRowState.columnName);
      if (!rowExists) {
        return {
          ...state,
          totals: [...state.totals, newTotalRowState]
        }
      }
      
      return {
        ...state,
        totals: state.totals.map(
          t => t.columnName === newTotalRowState.columnName
            ? ({ columnName: newTotalRowState.columnName, component: newTotalRowState.component })
            : t
        ),
      }
    }
  )
);

