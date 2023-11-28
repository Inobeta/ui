import { createFeatureSelector, createSelector } from '@ngrx/store';
import { IHttpStore } from '..';
import { IbAPITokens, IbSession } from '../../auth/session.model';
import { httpFeatureKey } from '../const';

const selectFeature = createFeatureSelector<IHttpStore>(httpFeatureKey);

export const ibSelectActiveSession = <T extends IbAPITokens | IbAPITokens>() => createSelector(
  selectFeature,
  (state: IHttpStore): IbSession<T> => state?.session?.activeSession as IbSession<T>
)
