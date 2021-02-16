import { createAction, props } from '@ngrx/store';


export const CounterActions = {
  increment: createAction('[Counter Component] Increment'),
  decrement: createAction('[Counter Component] Decrement'),
  reset: createAction('[Counter Component] Reset'),
  addingNumber: createAction('[Counter Component] Adding number', props<{ numberToAdd: number}>())
}
