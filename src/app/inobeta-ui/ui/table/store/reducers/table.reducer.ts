import { Sort } from '@angular/material/sort';
import { Action, createReducer, on } from '@ngrx/store';
import * as TableActions from '../actions/table.actions';

export const ibTableFeatureKey = 'ibTable';

export interface IbTableColumnState {
  columnName: string;
}

export interface IbTableFilterState extends IbTableColumnState {
  value: string;
}

export interface IbTableSortState extends IbTableColumnState {
  sortDirection: string;
}

export interface IbTableTotalRowState extends IbTableColumnState {
  func: string;
}

export interface IbTablePaginatorState {
  currentPageIndex: number;
  pageSize: number;
  currentPageSize: number;
}

export interface IbTableConfigState {
  filters: IbTableFilterState[];
  totals: IbTableTotalRowState[];
  sort: IbTableSortState;
  paginator: IbTablePaginatorState;
  default?: boolean;
}

export interface IbTableState {
  instances: {
    tableName: string
    config: IbTableConfigState
  }[];
  selectedConfig?: string;
}

export const ibTableFeatureInitialState: IbTableState = {
  instances: []
};


const reducer = createReducer(
  ibTableFeatureInitialState,

  on(TableActions.ibTableActionSetTotalRowCell,
    (state, newTotalRowState) => {
      if (!newTotalRowState.tableName){
        return { ...state };
      }
      const instance = state.instances?.find(i => i.tableName === newTotalRowState.tableName);
      if (!instance){
        return formatFieldState(state, newTotalRowState.tableName, null, [newTotalRowState.state]);
      }
      state.instances.splice(state.instances.indexOf(instance), 1);
      const rowExists = instance.config?.totals.find(t => t.columnName === newTotalRowState.state.columnName);
      if (!rowExists) {
        return formatFieldState(state, newTotalRowState.tableName, instance, [...(instance.config?.totals || []), newTotalRowState.state]);
      }
      return formatFieldState(state, newTotalRowState.tableName, instance, instance.config.totals.map(
        t => t.columnName === newTotalRowState.state.columnName
          ? ({ columnName: newTotalRowState.state.columnName, func: newTotalRowState.state.func })
          : t
      ));
    }
  ),

  on(TableActions.ibTableActionSetConfig, (state, newConfigData) => {
    if (!newConfigData.config){
      return {...state};
    }
    const instance = state.instances?.find(i => i.tableName === newConfigData.tableName);
    if (instance){
      state.instances.splice(state.instances.indexOf(instance), 1);
    }
    return {
      ...state,
      instances: [
        ...(state.instances || []),
        {
          tableName: newConfigData.tableName,
          config: newConfigData.config.config
        }
      ],
      selectedConfig: newConfigData.config.name
    };
  }),

  on(TableActions.ibTableActionSaveConfig, (state, saveConfigData) => {
    return {...state, selectedConfig: saveConfigData.options.data.name};
  }),

  on(TableActions.ibTableActionSelectSortingField, (state, sortData) => {
    if (!sortData.tableName){
      return { ...state };
    }
    const instance = state.instances?.find(i => i.tableName === sortData.tableName);
    if (instance){
      state.instances.splice(state.instances.indexOf(instance), 1);
    }
    return formatFieldState(state, sortData.tableName, instance, null, sortData.options);
  }),

  on(TableActions.ibTableActionAddFilterField,
    (state, addFilterState) => {
      if (!addFilterState.tableName){
        return { ...state };
      }
      const instance = state.instances?.find(i => i.tableName === addFilterState.tableName);
      if (!instance){
        return formatFieldState(state, addFilterState.tableName, null, null, [addFilterState.state]);
      }
      state.instances.splice(state.instances.indexOf(instance), 1);
      const rowExists = instance.config?.filters.find(t => t.columnName === addFilterState.state.columnName);
      if (!rowExists) {
        return formatFieldState(state,
          addFilterState.tableName,
          instance,
          null,
          null,
          [...(instance.config?.filters || []), addFilterState.state]);
      }
      return formatFieldState(state, addFilterState.tableName, instance, null, null, instance.config.filters.map(
        t => t.columnName === addFilterState.state.columnName
          ? ({ columnName: addFilterState.state.columnName, value: addFilterState.state.value })
          : t
      ));
    }
  ),

  on(TableActions.ibTableActionSetPaginator, (state, paginatorData) => {
    if (!paginatorData.tableName){
      return { ...state };
    }
    const instance = state.instances?.find(i => i.tableName === paginatorData.tableName);
    if (instance){
      state.instances.splice(state.instances.indexOf(instance), 1);
    }
    return formatFieldState(state, paginatorData.tableName, instance, null, null, null, paginatorData.state);
  }),
);


export function ibTableFeatureReducer(state: IbTableState = ibTableFeatureInitialState, action: Action) {
  return reducer(state, action);
}


function formatFieldState(state, tableName, instance, totals?, sort?, filters?, paginator?): IbTableState{

  return {
    ...state,
    instances: [
      ...(state.instances || []),
      {
        tableName,
        config: {
          filters: totals || sort || paginator ? instance?.config.filters || [] : filters || [],
          sort: totals || filters || paginator ? instance?.config.sort || [] : sort || {},
          totals: filters || sort || paginator ? instance?.config.totals || [] : totals || [],
          paginator: filters || sort || totals ? instance?.config.paginator || [] : paginator || {},
        }
      }
    ]
  };
}


