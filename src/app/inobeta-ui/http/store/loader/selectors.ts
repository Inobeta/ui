import { createSelector } from '@ngrx/store';
import { IHttpStore } from '..';

const selectFeature = (state) => state.ibHttpState;

export const ibSelectIsHttpLoading = createSelector(
  selectFeature,
  (state: IHttpStore): boolean => {
    return state?.loader?.showLoading ?? false
  }
)

export const ibSelectIsHttpUrlLoading = (endpoint: { url: string, method: string}) => createSelector(
  selectFeature,
  (state: IHttpStore): boolean => {
    return state?.loader?.pendingRequestList.findIndex(pl => pl.url === endpoint.url && pl.method === endpoint.method) >= 0 ?? false
  }
)
