/*
/!*
import {Injectable} from '@angular/core';
import {Action} from 'redux';
/!** Action Handling **!/
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
*!/
import {Action} from '@ngrx/store';

export class StateAction implements Action {
  type: any;
  payload: any;
}

export interface InitialState {
  prova: boolean;
}

export const INITIAL_STATE: InitialState = {
  prova: true
};

export function cashFlowReducer(state: InitialState = INITIAL_STATE, action: Action): InitialState {
  switch (action.type) {
    return Object.assign({}, state, {
      cashFlowAssociationsDates: {
        startDate: action['payload']['startDate'],
        endDate: action['payload']['endDate']
      }
    });
  }
}

*/
