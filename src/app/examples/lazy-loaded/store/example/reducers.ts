
import { Action, createReducer, on } from "@ngrx/store";
import { exampleActions } from "./actions";
import { IExampleState } from "./interfaces";


const INITIAL: IExampleState = {
  value: ''
}

const main = createReducer(INITIAL,
  on(exampleActions.exampleAction, (state, action) => {
    return {
      ...state,
      value: 'exampleValue'
    }
  }),
);


export function exampleReducer(state: IExampleState = INITIAL, action: Action){
  return main(state, action)
}
