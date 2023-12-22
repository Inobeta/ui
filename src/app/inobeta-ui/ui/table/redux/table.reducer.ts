import { Action, createReducer, on } from "@ngrx/store";
import * as TableFiltersActions from "./table.action";

export interface ITableFiltersState {
  tableFilters: any;
}

export const INITIAL_TABLE_FILTERS_STATE: ITableFiltersState = {
  tableFilters: {},
};

const mainTableFiltersReducer = createReducer(
  INITIAL_TABLE_FILTERS_STATE,
  on(TableFiltersActions.resetFilters, (state) => ({
    ...state,
    tableFilters: {},
  })),
  on(
    TableFiltersActions.addFilterToTable,
    (state, { tableName, filterName, filterValue }) => {
      let stateClone = structuredClone(state);
      let obj;
      if (stateClone.tableFilters[tableName]) {
        if (stateClone.tableFilters[tableName][filterName]) {
          stateClone.tableFilters[tableName][filterName].value = filterValue;
        } else {
          obj = {
            value: filterValue,
          };
          stateClone.tableFilters[tableName][filterName] = obj;
        }
      } else {
        obj = {};
        obj[filterName] = { value: filterValue };
        stateClone.tableFilters[tableName] = obj;
      }
      return {
        ...stateClone,
      };
    }
  ),
  on(
    TableFiltersActions.addSortToTable,
    (state, { tableName, sortType /*, emitChange*/ }) => {
      let stateClone = structuredClone(state);
      if (stateClone.tableFilters[tableName]) {
        stateClone.tableFilters[tableName].sortType = sortType;
      } else {
        stateClone.tableFilters[tableName] = {
          sortType,
        };
      }
      return {
        ...stateClone,
      };
    }
  ),
  on(
    TableFiltersActions.addPaginatorFiltersToTable,
    (state, { tableName, previousPageIndex, pageIndex, pageSize, lengthP }) => {
      const stateClone = structuredClone(state);
      const obj = {
        paginatorFilters: {
          previousPageIndex,
          pageIndex,
          pageSize,
          lengthP,
        },
      };

      if (stateClone.tableFilters[tableName]) {
        stateClone.tableFilters[tableName].paginatorFilters = obj.paginatorFilters;
      } else {
        stateClone.tableFilters[tableName] = obj;
      }
      return {
        ...stateClone,
      };
    }
  )
);

export function ibTableFiltersReducer(
  state: ITableFiltersState = INITIAL_TABLE_FILTERS_STATE,
  action: Action
) {
  return mainTableFiltersReducer(state, action);
}
