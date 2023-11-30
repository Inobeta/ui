import { createFeatureSelector, createSelector } from '@ngrx/store';
import { jwtDecode } from 'jwt-decode';
import { IHttpStore } from '..';
import { IbAPITokens, IbSession } from '../../auth/session.model';
import { httpFeatureKey } from '../const';

const selectFeature = createFeatureSelector<IHttpStore>(httpFeatureKey);

export const ibSelectActiveSession = <T extends IbAPITokens | IbAPITokens>() => createSelector(
  selectFeature,
  (state: IHttpStore): IbSession<T> | null => (state?.session?.activeSession as IbSession<T>) ?? null
)

export const ibSelectAccessTokenExp = createSelector(
  selectFeature,
  (state: IHttpStore): number => {
    const token = state.session.activeSession?.serverData?.accessToken
    if(!token) return 0
    const decoded: {
      exp: number
    } = jwtDecode(state.session.activeSession.serverData.accessToken);
    const now = new Date().getTime() / 1000;
    return  (decoded.exp - now - 3600) * 1000

  }
)
