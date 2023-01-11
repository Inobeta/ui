import { Action, ActionReducer } from "@ngrx/store";
import * as HydrationActions from "./actions";

function isHydrateSuccess(
  action: Action
): action is ReturnType<typeof HydrationActions.ibHydrateSuccess> {
  return action.type === HydrationActions.ibHydrateSuccess.type;
}

export const IbHydrationMetaReducer = (
  reducer: ActionReducer<any>
): ActionReducer<any> => {
  return (state, action) => {
    if (isHydrateSuccess(action)) {
      return action.state;
    } else {
      return reducer(state, action);
    }
  };
};
