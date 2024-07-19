import { viewsReducer } from "./views/reducer";
import { IView } from "./views/table-view";

export interface IViewState {
  views: IView[];
}

export const reducers = {
  views: viewsReducer,
};
