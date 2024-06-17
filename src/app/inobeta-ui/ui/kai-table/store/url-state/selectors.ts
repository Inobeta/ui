import { createFeatureSelector, createSelector } from "@ngrx/store";
import { kaiTableFeatureKey } from "../const";
import { IKaiTableStore } from "..";
import { IUrlStateState } from "./interfaces";
import { IbTableQsParams } from "../../table-url.service";

const selectFeature = createFeatureSelector<IKaiTableStore>(kaiTableFeatureKey);

const selectAllUrlStateStore = createSelector(
  selectFeature,
  (state: IKaiTableStore): IUrlStateState => {
    return state.urlState
  }
)

const selectUrlState = (tableName: string) => createSelector(
  selectAllUrlStateStore,
  (state: IUrlStateState) => {
    return state.tables.find((table) => table.tableName === tableName)
  }
)

export const ibTableSelectLastQueryStringRaw = (tableName: string) => createSelector(
  selectUrlState(tableName),
  (state): IbTableQsParams => ({
    ibfilter: state.filters,
    ibpage: state.page,
    ibpagesize: state.pageSize,
    ibaggregatedcolumns: state.aggregatedColumns,
    ibsort: state.sort,
    ibview: state.view
  })
)

export const ibTableSelectLastQueryString = (tableName: string) => createSelector(
  ibTableSelectLastQueryStringRaw(tableName),
  (state): string => JSON.stringify(state)
)
