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
  filters?: IbTableFilterState[];
  totals?: IbTableTotalRowState[];
  sort?: IbTableSortState;
  paginator?: IbTablePaginatorState;
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
      if (!newTotalRowState.tableName) {
        return { ...state };
      }
      const instance = state.instances?.find(i => i.tableName === newTotalRowState.tableName);
      if (!instance) {
        return formatFieldState(state, newTotalRowState.tableName, null, { totals: [newTotalRowState.state] });
      }
      state.instances.splice(state.instances.indexOf(instance), 1);
      const rowExists = instance.config?.totals.find(t => t.columnName === newTotalRowState.state.columnName);
      if (!rowExists) {
        return formatFieldState(state,
          newTotalRowState.tableName,
          instance,
          { totals: [...(instance.config?.totals || []), newTotalRowState.state] });
      }
      return formatFieldState(state, newTotalRowState.tableName, instance,
        {
          totals: instance.config.totals.map(
            t => t.columnName === newTotalRowState.state.columnName
              ? ({ columnName: newTotalRowState.state.columnName, func: newTotalRowState.state.func })
              : t
          )
        });
    }
  ),

  on(TableActions.ibTableActionSetConfig, (state, newConfigData) => {
    if (!newConfigData.config) {
      return { ...state };
    }
    const instance = state.instances?.find(i => i.tableName === newConfigData.tableName);
    if (instance) {
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
    return { ...state, selectedConfig: saveConfigData.options.data.name };
  }),

  on(TableActions.ibTableActionSelectSortingField, (state, sortData) => {
    if (!sortData.tableName) {
      return { ...state };
    }
    const instance = state.instances?.find(i => i.tableName === sortData.tableName);
    if (instance) {
      state.instances.splice(state.instances.indexOf(instance), 1);
    }
    return formatFieldState(state, sortData.tableName, instance, { sort: sortData.options });
  }),

  on(TableActions.ibTableActionAddFilterField,
    (state, addFilterState) => {
      if (!addFilterState.tableName) {
        return { ...state };
      }
      const instance = state.instances?.find(i => i.tableName === addFilterState.tableName);
      if (!instance) {
        return formatFieldState(state, addFilterState.tableName, null, { filters: [addFilterState.state] });
      }
      state.instances.splice(state.instances.indexOf(instance), 1);
      const rowExists = instance.config?.filters.find(t => t.columnName === addFilterState.state.columnName);
      if (!rowExists) {
        return formatFieldState(state,
          addFilterState.tableName,
          instance,
          { filters: [...(instance.config?.filters || []), addFilterState.state] });
      }
      return formatFieldState(state, addFilterState.tableName, instance, {
        filters: instance.config.filters.map(
          t => t.columnName === addFilterState.state.columnName
            ? ({ columnName: addFilterState.state.columnName, value: addFilterState.state.value })
            : t
        )
      });
    }
  ),

  on(TableActions.ibTableActionSetPaginator, (state, paginatorData) => {
    if (!paginatorData.tableName) {
      return { ...state };
    }
    const instance = state.instances?.find(i => i.tableName === paginatorData.tableName);
    if (instance) {
      state.instances.splice(state.instances.indexOf(instance), 1);
    }
    return formatFieldState(state, paginatorData.tableName, instance, { paginator: paginatorData.state });
  }),
);


export function ibTableFeatureReducer(state: IbTableState = ibTableFeatureInitialState, action: Action) {
  return reducer(state, action);
}


function formatFieldState(state, tableName, instance, newConfig: IbTableConfigState): IbTableState {

  const instanceConfig: { config: IbTableConfigState, tableName } =
    { config: { totals: [], sort: null, filters: [], paginator: null }, tableName };
  for (const k of Object.keys(instanceConfig.config)) {
    instanceConfig.config[k] = !newConfig[k] ? instance?.config[k] || instanceConfig.config[k] : newConfig[k] || instanceConfig.config[k];
  }
  return {
    ...state,
    instances: [
      ...(state.instances || []),
      instanceConfig
    ]
  };
}


