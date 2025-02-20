import { jwtDecode } from 'jwt-decode';

import { IbAPITokens, IbSession } from '../../auth/session.model';
import { createSelector } from '@ngrx/store';

const selectTokenExpiry = function(activeSession): number{
  const token = activeSession?.serverData?.accessToken
  if(!token) return 0
  const decoded: {
    exp: number
  } = jwtDecode(activeSession.serverData.accessToken);
  const now = new Date().getTime() / 1000;
  let exp = (decoded.exp - now - 300) * 1000
  if(exp < 0) exp = 0
  return  exp
}

const selectDecodedData = function<T>(activeSession): T {
  const token = activeSession?.serverData?.accessToken
  if(!token) return null
  return jwtDecode(activeSession.serverData.accessToken) as T;
}


export function ibSessionExtraSelectors({ selectActiveSession }){
  return {
    ibSelectActiveSession: <T extends IbAPITokens | IbAPITokens>() => createSelector(selectActiveSession, (activeSession): IbSession<T> | null => activeSession as IbSession<T>),
    ibSelectAccessTokenExp: createSelector(selectActiveSession, selectTokenExpiry),
    ibSelectDecodedData: <T extends IbAPITokens | IbAPITokens>() => createSelector(selectActiveSession, selectDecodedData<T>)
  }
}
