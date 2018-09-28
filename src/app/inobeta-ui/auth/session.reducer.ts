import {Action} from 'redux';
import {Injectable} from '@angular/core';
import {Session} from './session.model';

/** State Interface **/
export interface ISessionHandler {
  activeSession: Session;
}

export const SESSION_INITIAL_STATE: ISessionHandler = {
  activeSession: null
};


/** Action Handling **/
class SessionAction implements Action {
  type: any;
  payload: any;
}

@Injectable()
export class SessionActions {
  static LOGIN = 'SESSION_LOGIN';
  static LOGOUT = 'SESSION_LOGOUT';

  login = (data: Session, type: string): SessionAction => ({
    type: type,
    payload: data
  })

  logout = (type: string): SessionAction => ({
    type: type,
    payload: null
  })

}

/** Reducer (BL) **/
export function sessionReducer(lastState: ISessionHandler = SESSION_INITIAL_STATE,
                                   a: Action): ISessionHandler {

  const action = a as SessionAction;
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

