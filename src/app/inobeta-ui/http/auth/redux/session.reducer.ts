import {IbAPITokens, IbSession} from '../session.model';
import {Action, createReducer, on} from '@ngrx/store';
import * as SessionActions from './session.actions';
import { ibAuthActions } from '../../store/session/actions';

/**
 * @deprecated use IbSessionState
 */
export interface ISessionState {
  activeSession: IbSession<IbAPITokens>;
}

export const INITIAL_SESSION_STATE: ISessionState = {
  activeSession: null
};

const mainSessionReducer = createReducer(INITIAL_SESSION_STATE,
  on(SessionActions.changeNameSurname, (state, {name, surname}) => ({ ...state, activeSession: {
      ...state.activeSession,
      userData: {
        ...state.activeSession.userData,
        name,
        surname
      }
    } })),

  on(ibAuthActions.login, (state, { activeSession }) => ({ activeSession})),
  on(ibAuthActions.logout, state => ({ ...state, activeSession: null })),
);

export function ibSessionReducer(state: ISessionState = INITIAL_SESSION_STATE, action: Action) {
  return mainSessionReducer(state, action);
}
