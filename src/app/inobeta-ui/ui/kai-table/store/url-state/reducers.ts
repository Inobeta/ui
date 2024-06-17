
import { createReducer, on } from "@ngrx/store";
import { urlStateActions } from "./actions";
import { IUrlStateState, IbKaiTableNamedParams } from "./interfaces";

const INITIAL: IUrlStateState = {
  tables: []
}

export const urlStateReducer = createReducer(INITIAL,
  on(urlStateActions.setFilters, (stateIn, action) => {
    let state = structuredClone(stateIn);
    const table = getTable(action.tableName, state.tables);
    table.filters = action.params;
    return {
      ...state
    }
  }),
  on(urlStateActions.setPaginator, (stateIn, action) => {
    let state = structuredClone(stateIn);
    const table = getTable(action.tableName, state.tables);
    table.page = action.params.pageIndex;
    table.pageSize = action.params.pageSize;
    return {
      ...state
    }
  }),
  on(urlStateActions.setAggregatedColumns, (stateIn, action) => {
    let state = structuredClone(stateIn);
    const table = getTable(action.tableName, state.tables);
    table.aggregatedColumns = {...action.params}
    return {
      ...state
    }
  }),
  on(urlStateActions.setSort, (stateIn, action) => {
    let state = structuredClone(stateIn);
    const table = getTable(action.tableName, state.tables);
    table.sort = {...action.params};
    return {
      ...state
    }
  }),
  on(urlStateActions.handleViewChange, (stateIn, action) => {
    let state = structuredClone(stateIn);
    const table = getTable(action.tableName, state.tables);
    table.view = action.params.view;
    table.page = action.params.page;
    table.pageSize = action.params.pageSize;
    table.filters = action.params.filters;
    table.aggregatedColumns = action.params.aggregatedColumns;
    table.sort = action.params.sort;
    return {
      ...state
    }
  }),
);




function getTable(tableName: string, state: IbKaiTableNamedParams[]) {
  let table = state.find((table) => table.tableName === tableName);
  if(!table) {
    state.push({ tableName });
    table = state.find((table) => table.tableName === tableName);
  }
  return table;
}
