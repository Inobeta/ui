import { Component, OnInit } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { IbTableRowEvent } from "src/app/inobeta-ui/ui/kai-table/table.types";
import { IbUserExample, createNewUser } from "./users";

@Component({
  selector: "ib-kai-table-context-action-example",
  template: `
    <ib-kai-table
      [displayedColumns]="['name', 'fruit', 'number']"
      [dataSource]="dataSource"
      (ibRowClicked)="handleRowClicked($event)"
      class="mat-elevation-z8"
    >
      <ib-text-column name="name"></ib-text-column>
      <ib-text-column name="fruit"></ib-text-column>
      <ib-text-column name="number" sort></ib-text-column>
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
export class IbKaiTableContextActionExamplePage implements OnInit {
  dataSource = new MatTableDataSource<IbUserExample>();

  ngOnInit() {
    const users = Array.from({ length: 1000 }, (_, k) => createNewUser(k + 1));
    this.dataSource.data = users;
  }

  handleRowClicked(event: IbTableRowEvent<IbUserExample>) {
    if (event.type === "view") {
      alert(`${event.row.name} has ${event.row.number} ${event.row.fruit}(s)`);
      // do the thing
    }
  }
}
