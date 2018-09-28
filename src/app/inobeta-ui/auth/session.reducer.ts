import {Action} from 'redux';
import {Injectable} from '@angular/core';
import {Session} from './session.model';
import {StateAction} from '../redux/tools';

/** State Interface **/
export interface ISessionHandler {
  activeSession: Session;
}

export const SESSION_INITIAL_STATE: ISessionHandler = {
  activeSession: null
};


@Injectable()
export class SessionActions {
  static LOGIN = 'SESSION_LOGIN';
  static LOGOUT = 'SESSION_LOGOUT';
}

/** Reducer (BL) **/
export function sessionReducer(lastState: ISessionHandler = SESSION_INITIAL_STATE,
                                   a: Action): ISessionHandler {

  const action = a as StateAction;
  switch (action.type) {
    case SessionActions.LOGIN:
      return Object.assign({}, lastState, {
        activeSession: action.payload
      });
    case SessionActions.LOGOUT:
      return SESSION_INITIAL_STATE;
  }
  return lastState;
}

