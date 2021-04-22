import { Component } from '@angular/core';
import {Store, select} from '@ngrx/store';
import { Observable } from 'rxjs';
import { CounterActions } from './counter.action';

@Component({
  selector: 'ib-my-counter',
  templateUrl: './my-counter.component.html'
})
export class MyCounterComponent {
  count$: Observable<number>;

  constructor(private store: Store<any>) {
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

