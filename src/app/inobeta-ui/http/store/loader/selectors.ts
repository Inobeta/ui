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
