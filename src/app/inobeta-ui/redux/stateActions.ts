import {Action} from '@ngrx/store';
import {Injectable} from '@angular/core';

export class StateAction implements Action {
  type: any;
  payload: any;
}

@Injectable()
export class StateActions {
  stateChange = (payload, type: string): StateAction => ({
    type,
    payload
  })
}
