import { createAction, props } from "@ngrx/store";
import { IbAPITokens, IbSession } from "../../auth/session.model";

/**
 * User session actions
 */
export const ibAuthActions = {
  /**
   * Note that the name might be confusing. This action should be dispatched as a login success, rather than a login attempt.
   * 
   * Legacy: only stores a token in the storage. Does not call the `login()` function
   */
  login: createAction(
    "[IbSession Service] Login",
    props<{ activeSession: IbSession<IbAPITokens> }>()
  ),
  /** Dispatch and listen to this action to cleanup the user's session on logout */
  logout: createAction("[IbSession Service] Logout"),
  /** Dispatch to start a timer and refresh the access token once expired */
  refreshCycle: createAction("[IbSession Service] refreshCycle"),
};
