import { IPinnedView, pinnedViewReducer } from "./pinned-view/reducer";
import { viewsReducer } from "./views/reducer";
import { IView } from "./views/table-view";

export interface IViewState {
  views: IView[];
  pinnedViews: IPinnedView[];
}

export const reducers = {
  views: viewsReducer,
  pinnedViews: pinnedViewReducer,
};
