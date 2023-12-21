import { createReducer, on } from "@ngrx/store";
import { TableViewActions } from "../actions";
import { IView } from "./table-view";

export const initialState: ReadonlyArray<IView> = [];

export const viewsReducer = createReducer(
  initialState,
  on(TableViewActions.addView, (state, { view }) => [...state, view]),

  on(TableViewActions.deleteView, (state, { id }) =>
    state.filter((view) => view.id !== id)
  ),

  on(TableViewActions.renameView, (state, { id, name }) => {
    const view = structuredClone(state.find((v) => v.id === id));
    if (!view) {
      return state;
    }

    view.name = name;
    return [...state.filter((v) => v.id !== id), view];
  }),

  on(TableViewActions.saveView, (state, { id, data }) => {
    const view = structuredClone(state.find((v) => v.id === id));
    if (!view) {
      return state;
    }
    view.data = data;
    return [...state.filter((v) => v.id !== id), view];
  })
);
