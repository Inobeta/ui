import { Sort } from '@angular/material/sort';
import { Action, createReducer, on } from '@ngrx/store';
import * as TableActions from '../actions/table.actions';

export const ibTableFeatureKey = 'ibTable';

export interface IbTableFilterState {

}

export interface IbTableSortState {
  columnName: string;
  sortDirection: string;
}

export interface IbTableTotalRowState {
  columnName: string;
  func: string;
}

export interface IbTableConfigState {
  filters: IbTableFilterState[];
  totals: IbTableTotalRowState[];
  sort: IbTableSortState;
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
    return formatFieldState(state, sortData.tableName, null, null, sortData.options);
  })
);


export function ibTableFeatureReducer(state: IbTableState = ibTableFeatureInitialState, action: Action) {
  return reducer(state, action);
}


function formatFieldState(state, tableName, instance, totals?, sort?): IbTableState{
  return {
    ...state,
    instances: [
      ...(state.instances || []),
      {
        tableName,
        config: {
          filters: instance?.config.filters || [],
          sort: instance?.config.sort || sort || [],
          totals: instance?.config.totals || [] }
      }
    ]
  };
}


