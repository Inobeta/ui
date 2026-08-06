import { Component, ChangeDetectionStrategy } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { IbKaiTableModule } from "public_api";
import { IbTableLocalDataSource } from "public_api";
import { IbUserExample, createNewUser } from "./users";

@Component({
  selector: "ib-kai-table-datasource-example",
  standalone: true,
  imports: [IbKaiTableModule, MatButtonModule],
  template: `
    <div style="display:flex; align-items:center; gap:1em;">
      <button mat-raised-button (click)="refresh()">Refresh</button>
    </div>
    <div class="table-wrapper">
      <ib-kai-table tableName="datasourceExample" [dataSource]="dataSource" [displayedColumns]="displayedColumns">
        <ib-text-column headerText="Name" name="name" sort></ib-text-column>
        <ib-text-column headerText="Fruit" name="fruit" sort></ib-text-column>
        <ib-number-column headerText="Amount" name="amount" sort></ib-number-column>
      </ib-kai-table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [
    `:host {
        --ib-table-min-content-height: 0px;

        display: flex;
        flex: 1 1 auto;
        flex-direction: column;
        min-height: 0;
        overflow: hidden;
        padding: 30px;
    }
    .table-wrapper {
        display: flex;
        flex: 1 1 auto;
        flex-direction: column;
        min-height: 0;
        overflow: hidden;
      }

      @media (max-width: 767px) {
        .table-wrapper {
          overflow: auto;
        }
      }
      ib-kai-table {
        flex: 1 1 auto;
        min-height: 0;
      }

    `,
  ],
})
export class IbKaiTableDatasourceExamplePage {
  // Initial data as required: 50 users
  dataSource = new IbTableLocalDataSource<IbUserExample>(
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
