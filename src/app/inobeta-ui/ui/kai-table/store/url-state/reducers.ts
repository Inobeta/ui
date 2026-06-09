
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
    if (!table) {
      return state;
    }
    table.filters = action.params;
    return {
      ...state
    }
  }),
  on(urlStateActions.setPaginator, (stateIn, action) => {
    let state = structuredClone(stateIn);
    const table = getTable(action.tableName, state.tables);
    if (!table) {
      return state;
    }
    table.page = action.params.pageIndex;
    table.pageSize = action.params.pageSize;
    return {
      ...state
    }
  }),
  on(urlStateActions.setAggregatedColumns, (stateIn, action) => {
    let state = structuredClone(stateIn);
    const table = getTable(action.tableName, state.tables);
    if (!table) {
      return state;
    }
    table.aggregatedColumns = { ...action.params }
    return {
      ...state
    }
  }),
  on(urlStateActions.setSort, (stateIn, action) => {
    let state = structuredClone(stateIn);
    const table = getTable(action.tableName, state.tables);
    if (!table) {
      return state;
    }
    table.sort = { ...action.params };
    return {
      ...state
    }
  }),
);




function getTable(tableName: string, state: IbKaiTableNamedParams[]) {
  let table = state.find((table) => table.tableName === tableName);
  if (!table) {
    state.push({ tableName });
    table = state.find((table) => table.tableName === tableName);
  }
  return table;
}
