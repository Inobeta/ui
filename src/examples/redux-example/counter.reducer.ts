import {Action, createReducer, on} from '@ngrx/store';
import * as CounterActions from '../redux-example/counter.action';

export interface ICounterState {
  number: number;
}

export const INITIAL_COUNTER_STATE: ICounterState = {
  number: 0
};

const mainCounterReducer = createReducer(INITIAL_COUNTER_STATE,
  on(CounterActions.increment, state => ({ ...state, number: state.number + 1 })),
  on(CounterActions.decrement, state => ({ ...state, number: state.number - 1 })),
  on(CounterActions.reset, state => ({ ...state, number: 0 })),
  on(CounterActions.addingNumber, (state, { numberToAdd }) => ({ number: state.number + numberToAdd}))
);

export function counterReducer(state: ICounterState = INITIAL_COUNTER_STATE, action: Action) {
  return mainCounterReducer(state, action);
}
