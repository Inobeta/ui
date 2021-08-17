import { Action, createReducer, on } from '@ngrx/store';
import * as TableActions from '../actions/table.actions';

export const ibTableFeatureKey = 'ibTable';

export interface IbTableFilterState {

}

export interface IbTableSortState {

}

export interface IbTableTotalRowState {
  columnName: string;
  func: string;
}

export interface IbTableConfigState {
  filters: IbTableFilterState[];
  totals: IbTableTotalRowState[];
  sort: IbTableSortState;
}

export interface IbTableState {
  instances: {
    tableName: string
    config: IbTableConfigState
  }[];
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
        return formatTotalState(state, newTotalRowState, null, [newTotalRowState.state]);
      }
      state.instances.splice(state.instances.indexOf(instance), 1);
      const rowExists = instance.config?.totals.find(t => t.columnName === newTotalRowState.state.columnName);
      if (!rowExists) {
        return formatTotalState(state, newTotalRowState, instance, [...(instance.config?.totals || []), newTotalRowState.state]);
      }
      return formatTotalState(state, newTotalRowState, instance, instance.config.totals.map(
        t => t.columnName === newTotalRowState.state.columnName
          ? ({ columnName: newTotalRowState.state.columnName, func: newTotalRowState.state.func })
          : t
      ));
    }
  ),

  on(TableActions.ibTableActionSetConfig, (state, newConfigData) => {
    const instance = state.instances?.find(i => i.tableName === newConfigData.tableName);
    if(instance){
      state.instances.splice(state.instances.indexOf(instance), 1);
    }
    return {
      ...state,
      instances: [
        ...(state.instances || []),
        {
          tableName: newConfigData.tableName,
          config: newConfigData.config
        }
      ]
    };
  })
);


export function ibTableFeatureReducer(state: IbTableState = ibTableFeatureInitialState, action: Action) {
  return reducer(state, action);
}


function formatTotalState(state, newTotalRowState, instance, totals): IbTableState{
  return {
    ...state,
    instances: [
      ...(state.instances || []),
      {
        tableName: newTotalRowState.tableName,
        config: { filters: instance?.filters || [], sort: instance?.sort || [], totals }
      }
    ]
  };
}


