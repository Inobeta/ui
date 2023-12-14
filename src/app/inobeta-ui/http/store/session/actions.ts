import { createAction, props } from "@ngrx/store";
import { IbAPITokens, IbSession } from "../../auth/session.model";

export const ibAuthActions = {
  login: createAction('[IbSession Service] Login', props<{ activeSession: IbSession<IbAPITokens>}>()),
  logout: createAction('[IbSession Service] Logout'),
  refreshCycle: createAction('[IbSession Service] refreshCycle'),
}
