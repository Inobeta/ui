import { Action, createReducer, on } from "@ngrx/store";
import { ibLoaderActions } from "./actions";
import { IbLoaderState } from "./interfaces";


const INITIAL: IbLoaderState = {
  showLoading: false,
  skipShow: false,
  pendingRequestList: []
}

export const ibLoaderReducerMain = createReducer(INITIAL,
  on(ibLoaderActions.incLoading, (state, {url, method}) => {
    const pendingRequestList = [...state.pendingRequestList, {url, method} ]
    return {
      ...state,
      pendingRequestList,
      showLoading: (!state.skipShow && pendingRequestList.length > 0)
    }
  }),
  on(ibLoaderActions.decLoading, (state, {url, method}) => {
    const pendingRequestList = state.pendingRequestList.reduce((acc, pl) => {
      if(pl.url !== url || pl.method !== method){
        acc.push(pl)
      }
      return acc
    }, [])
    return {
      ...state,
      skipShow: false,
      pendingRequestList,
      showLoading: (pendingRequestList.length > 0)
    }
  }),
  on(ibLoaderActions.skipShow, (state) => ({
    ...state,
    skipShow: true
  })),
);
