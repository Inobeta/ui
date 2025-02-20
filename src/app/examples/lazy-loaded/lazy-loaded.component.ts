import { Component, inject, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { exampleActions } from "./store/example/actions";
import { selectValue } from "./store";

@Component({
    selector: "ib-lazy",
    template: `
    redux hydration test
    <pre>{{ exampleValue$$() }}</pre>
    <button (click)="setValue()">set a value</button>
  `,
    standalone: false
})
export class LazyLoadedComponent implements OnInit {
  store = inject(Store);
  exampleValue$$ = this.store.selectSignal(selectValue);

  ngOnInit() {}

  setValue() {
    this.store.dispatch(exampleActions.exampleAction());
  }
}
