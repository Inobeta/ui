import { createFeatureSelector, createSelector } from "@ngrx/store";
import { IView } from "./table-view";

export const selectViews = createFeatureSelector("ibTableViews");

export const selectTableViews = (tableName: string) =>
  createSelector(selectViews, (views: IView[]) =>
    views.filter((v) => v.groupName === tableName)
  );
