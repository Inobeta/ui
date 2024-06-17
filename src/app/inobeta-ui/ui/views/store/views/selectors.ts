import { createFeatureSelector, createSelector } from "@ngrx/store";
import { IViewState } from "../reducer";
import { IView } from "./table-view";

export const selectViewsFeature = createFeatureSelector("ibViews");
export const selectViews = createSelector(
  selectViewsFeature,
  (state: IViewState) => state.views
);

export const selectTableViews = (tableName: string) =>
  createSelector(selectViews, (views: IView[]) =>
    views.filter((v) => v.groupName === tableName).sort((a, b) => a.name.localeCompare(b.name))
  );
