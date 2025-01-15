import { Component, inject } from '@angular/core';
import {Store} from '@ngrx/store';
import { CounterActions, selectDoubleCounter, selectNumber } from './counter.feature';

@Component({
    selector: 'ib-my-counter',
    templateUrl: './my-counter.component.html'
})
export class MyCounterComponent {
  store = inject(Store);
  count$$ = this.store.selectSignal(selectNumber);
  doubleCount$$ = this.store.selectSignal(selectDoubleCounter);


  increment() {
    this.store.dispatch (CounterActions.increment());
  }

  decrement() {
    this.store.dispatch(CounterActions.decrement());
  }

  reset() {
    this.store.dispatch(CounterActions.reset());
  }

  addingNumber(n) {
    this.store.dispatch(CounterActions.addingNumber({numberToAdd: n}));
  }
}

