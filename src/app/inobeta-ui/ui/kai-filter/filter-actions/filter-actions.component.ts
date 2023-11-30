import { Component } from "@angular/core";

@Component({
  selector: "ib-filter-actions",
  template: `
    <mat-divider></mat-divider>
    <section
      style="display:flex; justify-content: flex-end; margin-right: 1em; margin-top: 0.5em"
    >
      <ng-content></ng-content>
    </section>
  `,
})
export class IbFilterActions {}
