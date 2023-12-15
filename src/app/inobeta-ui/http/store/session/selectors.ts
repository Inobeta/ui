import { createSelector } from '@ngrx/store';
import { jwtDecode } from 'jwt-decode';
import { IHttpStore } from '..';
import { IbAPITokens, IbSession } from '../../auth/session.model';

const selectFeature = (state) => state.ibHttpState;

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
    let exp = (decoded.exp - now - 300) * 1000
    if(exp < 0) exp = 0
    return  exp
  }
)


export const ibSelectDecodedData = <T>() => createSelector(
  selectFeature,
  (state: IHttpStore): T | null => {
    const token = state.session.activeSession?.serverData?.accessToken
    if(!token) return null
    return jwtDecode(state.session.activeSession.serverData.accessToken) as T;
  }
)

