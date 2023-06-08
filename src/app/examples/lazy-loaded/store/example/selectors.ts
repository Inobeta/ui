import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ILazyLoadedStore, lazyLoadedFeatureKey } from '..';
import { IExampleState } from './interfaces';



export const selectFeature = createFeatureSelector<ILazyLoadedStore>(lazyLoadedFeatureKey);


export const selectAllExampleStore = createSelector(
  selectFeature,
  (state: ILazyLoadedStore): IExampleState => {
    return state.example
  }
)
export const selectExampleValue = createSelector(
  selectFeature,
  (state: ILazyLoadedStore): string => {
    return state.example.value
  }
)
