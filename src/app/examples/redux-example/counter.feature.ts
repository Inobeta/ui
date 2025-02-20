import { createActionGroup, createFeature, createSelector, emptyProps, props } from '@ngrx/store';

import { createReducer, on} from '@ngrx/store';

export const CounterActions = createActionGroup({
  source: '[Counter Feature]',
  events: {
    increment: emptyProps(),
    decrement: emptyProps(),
    reset: emptyProps(),
    addingNumber: props<{ numberToAdd: number }>()
  }
});

export type ICounterState = {
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


export const ibCounterExampleFeature = createFeature({
  name: 'ibCounterExampleFeature',
  reducer: mainCounterReducer,
  extraSelectors: ({selectNumber}) => ({
    selectDoubleCounter: createSelector(selectNumber, num => num * 2)
  })
})

export const {
  selectNumber,
  selectDoubleCounter
} = ibCounterExampleFeature;
