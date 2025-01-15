import { createSelector } from '@ngrx/store';
import { ibRequestHttp } from 'public_api';
const isHttpLoading =
  (showLoading: boolean): boolean => {
    return showLoading ?? false
  }

const isHttpUrlLoading = (endpoint: { url: string, method: string})  => (pendingRequestList: ibRequestHttp[]): boolean => {
  return pendingRequestList.findIndex(pl => pl.url === endpoint.url && pl.method === endpoint.method) >= 0
}


export function ibLoaderExtraSelectors({ selectShowLoading, selectPendingRequestList }){
  return {
    ibSelectIsHttpLoading: createSelector(selectShowLoading, isHttpLoading),
    ibSelectIsHttpUrlLoading: (endpoint: { url: string, method: string})  => createSelector(selectPendingRequestList, isHttpUrlLoading(endpoint))
  }
}
