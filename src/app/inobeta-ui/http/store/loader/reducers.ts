import { Action, createReducer, on } from "@ngrx/store";
import { ibLoaderActions } from "./actions";
import { IbLoaderState } from "./interfaces";


const INITIAL: IbLoaderState = {
  pendingRequests: 0,
  showLoading: false,
  skipShow: false
}

const main = createReducer(INITIAL,
  on(ibLoaderActions.incLoading, (state) => {
    const pendingRequests = state.pendingRequests +1
    return {
      ...state,
      pendingRequests,
      showLoading: (!state.skipShow && pendingRequests > 0)
    }
  }),
  on(ibLoaderActions.decLoading, (state) => {
    const pendingRequests = state.pendingRequests -1
    return {
      ...state,
      pendingRequests,
      skipShow: false,
      showLoading: (pendingRequests > 0)
    }
  }),
  on(ibLoaderActions.skipShow, (state) => ({
    ...state,
    skipShow: true
  })),
);


export function loaderReducer(state: IbLoaderState = INITIAL, action: Action){
  return main(state, action)
}
