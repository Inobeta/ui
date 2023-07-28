import { createFeatureSelector, createSelector } from "@ngrx/store";
import { TableView } from "./table-view";

export const selectViews = createFeatureSelector("ibTableViews");

export const selectTableViews = (tableName: string) =>
  createSelector(selectViews, (views: TableView[]) =>
    views.filter((v) => v.tableName === tableName)
  );
