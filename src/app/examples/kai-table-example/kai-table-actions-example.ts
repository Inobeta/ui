import { Component, OnInit } from "@angular/core";
import { IbUserExample, createNewUser } from "./users";

@Component({
  selector: "ib-kai-table-context-action-example",
  template: `
    <ib-kai-table
      style="text-direction: rtl"
      [displayedColumns]="['name', 'fruit', 'number']"
      [data]="data"
      class="mat-elevation-z8"
    >
      <ib-text-column name="name"></ib-text-column>
      <ib-text-column name="fruit"></ib-text-column>
      <ib-text-column name="number" sort></ib-text-column>
      <ib-column ib-action-column>
        <section *ibCellDef="let element">
          <button mat-icon-button (click)="handleShowReport(element)">
            <mat-icon>chevron_right</mat-icon>
          </button>
          <button mat-icon-button [matMenuTriggerFor]="menu">
            <mat-icon>more_vert</mat-icon>
          </button>
          <mat-menu #menu="matMenu">
            <button mat-menu-item (click)="handleTest(element)">test</button>
          </mat-menu>
        </section>
      </ib-column>
    </ib-kai-table>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        padding: 30px;
      }
    `,
  ],
})
export class IbKaiTableActionColumnExamplePage implements OnInit {
  data: IbUserExample[];

  ngOnInit() {
    this.data = Array.from({ length: 1000 }, (_, k) => createNewUser(k + 1));
  }

  handleShowReport(user: IbUserExample) {
    alert(`${user.name} has ${user.number} ${user.fruit}(s)`);
  }

  handleTest(user: IbUserExample) {
    alert(`this is user ${user.id}`);
  }
}
