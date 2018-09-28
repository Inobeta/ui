import {Injectable} from '@angular/core';
import {Action} from 'redux';

/** Action Handling **/
export class StateAction implements Action {
  type: any;
  payload: any;
}

@Injectable()
export class StateActions {
  stateChange = (payload, type: string): StateAction => ({
    type: type,
    payload: payload
  })
}

