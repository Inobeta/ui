import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IHttpStore } from '..';
import { httpFeatureKey } from '../const';

const selectFeature = createFeatureSelector<IHttpStore>(httpFeatureKey);


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
