import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { IbKaiTableModule } from "public_api";
import { IbTableDataSource } from "../../inobeta-ui/ui/kai-table/table-data-source";
import { IbUserExample, createNewUser } from "./users";

@Component({
  selector: "ib-kai-table-datasource-example",
  standalone: true,
  imports: [IbKaiTableModule, MatButtonModule],
  template: `
    <div style="display:flex; align-items:center; gap:1em;">
      <button mat-raised-button (click)="refresh()">Refresh</button>
    </div>

    <ib-kai-table [dataSource]="dataSource" [displayedColumns]="displayedColumns">
      <ib-text-column headerText="Name" name="name" sort></ib-text-column>
      <ib-text-column headerText="Fruit" name="fruit" sort></ib-text-column>
      <ib-number-column headerText="Amount" name="amount" sort></ib-number-column>
    </ib-kai-table>
  `,
  styles: [
    `:host { display: flex; flex-direction: column; padding: 30px; gap: 1em; }`,
  ],
})
export class IbKaiTableDatasourceExamplePage {
  // Initial data as required: 50 users
  dataSource = new IbTableDataSource<IbUserExample>(
    Array.from({ length: 50 }, (_, k) => createNewUser(k + 1))
  );
  displayedColumns = ["name", "fruit", "amount"];

  refresh() {
    // Replace data with a new array instance of 50 users
    this.dataSource.data = Array.from({ length: 50 }, (_, k) =>
      createNewUser(k + 1)
    );
  }
}
