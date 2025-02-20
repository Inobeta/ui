import { combineReducers, createFeature, createSelector } from "@ngrx/store";
import { viewsReducer } from "./views/reducer";
import { IView } from "./views/table-view";

export interface IViewState {
  views: IView[];
}

export const reducers = {
  views: viewsReducer,
};


export const ibViewsFeature = createFeature({
  name: "ibViews",
  reducer: combineReducers(reducers),
  extraSelectors: ({ selectIbViewsState }) => {
    const selectViews = createSelector(
      selectIbViewsState,
      (state: IViewState) => state.views
    );

    const selectTableViews = (tableName: string) =>
      createSelector(selectViews, (views: IView[]) =>
        views
          .filter((v) => v.groupName === tableName)
          .sort((a, b) => a.name.localeCompare(b.name))
      );

    return {
      selectViews,
      selectTableViews,
    };
  },
})


export const {
  selectViews,
  selectTableViews
} = ibViewsFeature

