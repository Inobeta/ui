import { createReducer, on } from "@ngrx/store";
import { TableViewActions } from "./actions";
import { TableView } from "./table-view";

export const initialState: ReadonlyArray<TableView> = [];

export const viewsReducer = createReducer(
  initialState,
  on(TableViewActions.addView, (state, { view }) => [
    ...state,
    view,
  ]),

  on(TableViewActions.removeView, (state, { id }) =>
    state.filter((view) => view.id !== id)
  ),

  on(TableViewActions.renameView, (state, { id, name }) => {
    const view = state.find((v) => v.id === id);
    if (!view) {
      return state;
    }

    view.name = name;
    return [...state];
  }),

  on(TableViewActions.saveView, (state, { id, filter }) => {
    const view = state.find((v) => v.id === id);
    if (!view) {
      return state;
    }
    view.filter = filter;
    return [...state];
  })
);
