
import { createReducer, on } from "@ngrx/store";
import { exampleActions } from "./actions";
import { IExampleState } from "./interfaces";


const INITIAL: IExampleState = {
  value: ''
}

export const exampleMainReducer = createReducer(INITIAL,
  on(exampleActions.exampleAction, (state, action) => {
    return {
      ...state,
      value: 'exampleValue'
    }
  }),
);
