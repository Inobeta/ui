import { createSelector } from "@ngrx/store";
import { IViewState } from "../reducer";
import { selectViews, selectViewsFeature } from "../views/selectors";
import { IView } from "../views/table-view";
import { IPinnedView } from "./reducer";

const selectPinnedViews = createSelector(
  selectViewsFeature,
  (state: IViewState) => state.pinnedViews
);

export const selectPinnedView = (groupName: string) =>
  createSelector(
    selectPinnedViews,
    selectViews,
    (favViews: IPinnedView[], views: IView[]) => {
      const fav = favViews.find((v) => v.groupName === groupName);
      if (!fav) {
        return;
      }

      return views.find((v) => v.id === fav.viewId);
    }
  );
