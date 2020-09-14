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
    if (state.tableFilters[tableName]){
      state.tableFilters[tableName].sortType = sortType;
    } else {
      state.tableFilters[tableName] = {
        sortType
      };
    }
/*
    let obj;
    let obj2;
    let obj3;
    if (state.tableFilters[tableName]) {
      if (state.tableFilters[tableName][sortType.active]) {
        if (state.tableFilters[tableName][sortType.active]['columnSort']) {
          state.tableFilters[tableName][sortType.active]['columnSort'].sort = sortType;
          state.tableFilters[tableName][sortType.active]['columnSort'].emitChange = emitChange;
        } else {
          obj = {};
          obj['sort'] = sortType;
          obj['emitChange'] = emitChange;
          state.tableFilters[tableName][sortType.active]['columnSort'] = obj;
        }
      } else {
        obj = {};
        obj['sort'] = sortType;
        obj['emitChange'] = emitChange;
        obj2 = {};
        obj2['columnSort'] = obj;
        state.tableFilters[tableName][sortType.active] = obj2;
      }
    } else {
      obj = {};
      obj['sort'] = sortType;
      obj['emitChange'] = emitChange;
      obj2 = {};
      obj2['columnSort'] = obj;
      obj3 = {};
      obj3[sortType.active] = obj2;
      state.tableFilters[tableName] = obj3;
    }*/
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

export function tableFiltersReducer(state: ITableFiltersState = INITIAL_TABLE_FILTERS_STATE, action: Action) {
  return mainTableFiltersReducer(state, action);
}
