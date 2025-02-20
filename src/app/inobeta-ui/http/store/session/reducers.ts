
import { createReducer, on } from "@ngrx/store";
import { ibAuthActions } from "./actions";
import { IbSessionState} from "./interfaces";


const INITIAL: IbSessionState = {
  activeSession: undefined
}


export const ibSessionReducerMain = createReducer(INITIAL,
  on(ibAuthActions.login, (state, { activeSession }) => ({
    activeSession: {...activeSession}
  })),
  on(ibAuthActions.logout, state => ({activeSession: undefined}))
)
