import { ActionReducer, UPDATE } from "@ngrx/store";
import * as HydrationActions from "./actions";

export const getIbHydrationMetaReducer = (ibSessionStorageKey: string, ibReduxPersistKeys: string[]) => {
  return (
    reducer: ActionReducer<any>
  ): ActionReducer<any> => {
    return (state, action) => {

      switch(action.type){
        case HydrationActions.ibHydrate.type:
        case UPDATE:
          return {
            ...state,
            ...loadState(ibSessionStorageKey, ibReduxPersistKeys)
          };
        default:
          return reducer(state, action);
      }
    };
  };
}



function loadState(ibSessionStorageKey: string, ibReduxPersistKeys: string[]){
  const storageValue = localStorage.getItem(ibSessionStorageKey);
  if (storageValue) {
    try {
      const state = JSON.parse(storageValue);
      const filteredState = {}
      for(let fk of ibReduxPersistKeys){
        filteredState[fk] = state[fk]
      }
      console.log('[IbHydrade] load from local storage', filteredState)
      return filteredState;
    } catch {
      localStorage.removeItem(ibSessionStorageKey);
    }
  }
}
