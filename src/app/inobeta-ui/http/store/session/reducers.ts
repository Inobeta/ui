
import { Action, createReducer, on } from "@ngrx/store";
import { ibAuthActions } from "./actions";
import { IbSessionState } from "./interfaces";


const INITIAL: IbSessionState = {
  activeSession: undefined
}

const main = createReducer(INITIAL,
  on(ibAuthActions.login, (state, { activeSession }) => ({
    activeSession: {...activeSession}
  })),
  on(ibAuthActions.logout, state => ({activeSession: undefined})),
);


export function sessionReducer(state: IbSessionState = INITIAL, action: Action){
  return main(state, action)
}
