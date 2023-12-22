import { createReducer, on } from "@ngrx/store";
import { TableViewActions } from "../actions";

export interface IPinnedView {
  groupName: string;
  viewId: string;
}

export const initialState: ReadonlyArray<IPinnedView> = [];

export const pinnedViewReducer = createReducer(
  initialState,
  on(TableViewActions.pinView, (state, { groupName, id }) => {
    const view = structuredClone(state.find((v) => v.groupName === groupName));
    if (!view) {
      return [...state, { groupName, viewId: id }];
    }

    view.viewId = id;
    return [...state.filter(v => v.groupName !== groupName), view];
  }),
  on(TableViewActions.unpinView, (state, { groupName, id }) => {
    return state.filter((v) => v.groupName !== groupName);
  })
);
