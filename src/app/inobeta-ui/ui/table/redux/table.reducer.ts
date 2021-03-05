import {Action, createReducer, on} from '@ngrx/store';
import * as TableFiltersActions from './table.action';

export interface ITableFiltersState {
  tableFilters: any;
}

export const INITIAL_TABLE_FILTERS_STATE: ITableFiltersState = {
  tableFilters: {}
};

const mainTableFiltersReducer = createReducer(INITIAL_TABLE_FILTERS_STATE,
  on(TableFiltersActions.resetFilters, state => ({...state, tableFilters: {}})),
  on(TableFiltersActions.addFilterToTable, (state, {tableName, filterName, filterValue}) => {
    let obj;
    if (state.tableFilters[tableName]) {
      if (state.tableFilters[tableName][filterName]) {
        state.tableFilters[tableName][filterName].value = filterValue;
      } else {
        obj = {
          value: filterValue
        };
        state.tableFilters[tableName][filterName] = obj;
      }
    } else {
      obj = {};
      obj[filterName] = {value: filterValue};
      state.tableFilters[tableName] = obj;
    }
    return {
      ...state
    };
  }),
on(TableFiltersActions.addSortToTable, (state, {tableName, sortType/*, emitChange*/}) => {
    if (state.tableFilters[tableName]) {
      state.tableFilters[tableName].sortType = sortType;
    } else {
      state.tableFilters[tableName] = {
        sortType
      };
    }
    return {
      ...state
    };
  }),
  on(TableFiltersActions.addPaginatorFiltersToTable, (state, {tableName, previousPageIndex, pageIndex, pageSize, lengthP}) => {
    const obj = {
      paginatorFilters: {
        previousPageIndex,
        pageIndex,
        pageSize,
        lengthP
      }
    };

    if (state.tableFilters[tableName]) {
      state.tableFilters[tableName].paginatorFilters = obj.paginatorFilters;
    } else {
      state.tableFilters[tableName] = obj;
    }
    return {
      ...state
    };
  })
);

export function ibTableFiltersReducer(state: ITableFiltersState = INITIAL_TABLE_FILTERS_STATE, action: Action) {
  return mainTableFiltersReducer(state, action);
}
