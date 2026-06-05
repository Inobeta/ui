import { createSelector } from "@ngrx/store";
import { IbKaiTableNamedParams } from "./interfaces";


const selectUrlState = (tableName: string) => (tables: IbKaiTableNamedParams[]): IbKaiTableNamedParams => {
  return tables?.find((table) => table.tableName === tableName)
}

const selectLastQueryStringRaw = (state?: IbKaiTableNamedParams) => ({
  ibfilter: state?.filters,
  ibpage: state?.page,
  ibpagesize: state?.pageSize,
  ibaggregatedcolumns: state?.aggregatedColumns,
  ibsort: state?.sort,

})

const selectLastQueryString = (state: any): string => JSON.stringify(state)


export const ibKaiTableExtraSelectors = ({ selectTables }) => {
  const ibTableSelectUrlState = (tableName: string) => createSelector(selectTables, selectUrlState(tableName))

  const ibTableSelectLastQueryStringRaw = (tableName: string) => createSelector(
    ibTableSelectUrlState(tableName),
    selectLastQueryStringRaw
  )
  const ibTableSelectLastQueryString = (tableName: string) => createSelector(
    ibTableSelectLastQueryStringRaw(tableName),
    selectLastQueryString
  )
  return {
    ibTableSelectUrlState,
    ibTableSelectLastQueryStringRaw,
    ibTableSelectLastQueryString
  }
}
