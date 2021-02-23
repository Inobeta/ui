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
  on(SessionActions.logout, state => ({ ...state, activeSession: null })),
  on(SessionActions.changeNameSurname, (state, {name, surname}) => ({ ...state, activeSession: {
      valid: state.activeSession.valid,
      user: state.activeSession.user,
      authToken: state.activeSession.authToken,
      userData: {
        id: state.activeSession.userData.id,
        username: state.activeSession.userData.username,
        name,
        surname,
        is_active: state.activeSession.userData.is_active,
        email: state.activeSession.userData.email,
        created_at: state.activeSession.userData.created_at,
        updated_at: state.activeSession.userData.updated_at,
        user_type_id: state.activeSession.userData.user_type_id,
        token: state.activeSession.userData.token,
      }
    } }))
);

export function sessionReducer(state: ISessionState = INITIAL_SESSION_STATE, action: Action) {
  return mainSessionReducer(state, action);
}
