import { Component } from '@angular/core';
import {Store, select, Action} from '@ngrx/store';
import { Observable } from 'rxjs';
import * as CounterActions from './counter.action';
import {selectCounter} from './counter.reducer';

@Component({
  selector: 'ib-my-counter',
  templateUrl: './my-counter.component.html'
})
export class MyCounterComponent {
  count$: Observable<number>;

  constructor(private store: Store) {
    this.count$ = store.pipe(select(rootState => rootState.countState.number));
  }

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
