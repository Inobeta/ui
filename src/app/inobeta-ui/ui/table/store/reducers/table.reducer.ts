import { Action, createReducer, on } from '@ngrx/store';
import * as TableActions from '../actions/table.actions';

export const ibTableFeatureKey = 'ibTable';

export interface IbTableFilterState {

}

export interface IbTableSortState {

}

export interface IbTableTotalRowState {
  columnName: string;
  component: any;
}

export interface IbTableState {
  filters: IbTableFilterState[];
  totals: IbTableTotalRowState[];
  sort: IbTableSortState;
}

export const ibTableFeatureInitialState: IbTableState = {
  filters: [],
  totals: [],
  sort: {},
};


const reducer = createReducer(
  ibTableFeatureInitialState,

  on(TableActions.ibTableActionSetTotalRowCell,
    (state, newTotalRowState) => {
      const rowExists = state.totals.find(t => t.columnName === newTotalRowState.columnName);
      if (!rowExists) {
        return {
          ...state,
          totals: [...state.totals, newTotalRowState]
        };
      }

      return {
        ...state,
        totals: state.totals.map(
          t => t.columnName === newTotalRowState.columnName
            ? ({ columnName: newTotalRowState.columnName, component: newTotalRowState.component })
            : t
        ),
      };
    }
  )
);


export function ibTableFeatureReducer(state: IbTableState = ibTableFeatureInitialState, action: Action) {
  return reducer(state, action);
}


