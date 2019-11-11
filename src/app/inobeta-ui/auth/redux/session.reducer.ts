import {Session} from '../session.model';
import {Action, createReducer, on} from '@ngrx/store';
import * as SessionActions from './session.actions';

export interface ISessionState {
  activeSession: Session;
}

export const INITIAL_SESSION_STATE: ISessionState = {
  activeSession: null
};

const mainSessionReducer = createReducer(INITIAL_SESSION_STATE,
  on(SessionActions.login, (state, { activeSession }) => ({ activeSession})),
  on(SessionActions.logout, state => ({ ...state, activeSession: null }))
);

export function sessionReducer(state: ISessionState = INITIAL_SESSION_STATE, action: Action) {
  return mainSessionReducer(state, action);
}
