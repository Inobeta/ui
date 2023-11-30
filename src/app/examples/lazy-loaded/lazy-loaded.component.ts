import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { exampleActions } from './store/example/actions';
import { selectExampleValue } from './store/example/selectors';

@Component({
  selector: 'ib-lazy',
  template: `
  redux hydration test
  <pre>{{exampleValue$ | async }}</pre>
  <button (click)="setValue()">set a value</button>
  `
})

export class LazyLoadedComponent implements OnInit {
  exampleValue$: Observable<string> = this.store.select(selectExampleValue)
  constructor(
    private store: Store
  ) { }

  ngOnInit() { }

  setValue(){
    this.store.dispatch(exampleActions.exampleAction())
  }
}
