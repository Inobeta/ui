import { Action, createReducer, on } from "@ngrx/store";
import { ibLoaderActions } from "./actions";
import { IbLoaderState } from "./interfaces";


const INITIAL: IbLoaderState = {
  pendingRequests: 0,
  showLoading: false,
  skipShow: false,
  pendingRequestList: []
}

const main = createReducer(INITIAL,
  on(ibLoaderActions.incLoading, (state, {url, method}) => {
    const pendingRequests = state.pendingRequests +1
    return {
      ...state,
      pendingRequests,
      pendingRequestList: [...state.pendingRequestList, {url, method} ],
      showLoading: (!state.skipShow && pendingRequests > 0)
    }
  }),
  on(ibLoaderActions.decLoading, (state, {url, method}) => {
    const pendingRequests = state.pendingRequests -1
    const pendingRequestList = state.pendingRequestList.reduce((acc, pl) => {
      if(pl.url !== url || pl.method !== method){
        acc.push(pl)
      }
      return acc
    }, [])
    return {
      ...state,
      pendingRequests,
      skipShow: false,
      pendingRequestList,
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
