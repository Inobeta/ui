import { Component, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { IbSelectionColumn } from "../../inobeta-ui/ui/kai-table/columns/selection-column";
import { createNewUser } from "./users";

@Component({
  selector: "ib-kai-table-full-example",
  template: `
    <ib-kai-table
      tableName="fullExample"
      [displayedColumns]="['name', 'fruit', 'number', 'aDate', 'actions']"
      [dataSource]="dataSource"
    >
      <ib-table-action-group>
        <button
          mat-icon-button
          (click)="getSelection()"
          [disabled]="selectionColumn?.selection.selected.length === 0"
        >
          <mat-icon>list</mat-icon>
        </button>
        <ib-table-data-export-action></ib-table-data-export-action>
      </ib-table-action-group>

      <ib-table-view-group></ib-table-view-group>
      <ib-filter>
        <ib-search-bar></ib-search-bar>

        <ib-text-filter ibTableColumnName="name">Name</ib-text-filter>
        <ib-tag-filter ibTableColumnName="fruit">Fruit</ib-tag-filter>
        <ib-number-filter ibTableColumnName="number">Amount</ib-number-filter>
        <ib-date-filter ibTableColumnName="aDate">Purchased</ib-date-filter>
      </ib-filter>

      <ib-selection-column
        (ibRowSelectionChange)="selectionChange($event)"
      ></ib-selection-column>
      <ib-text-column headerText="Name" name="name" sort></ib-text-column>
      <ib-text-column headerText="Fruit" name="fruit" sort></ib-text-column>
      <ib-number-column
        headerText="Amount"
        name="number"
        sort
      ></ib-number-column>
      <ib-date-column headerText="Purchased" name="aDate" sort></ib-date-column>
      <ib-column headerText="" name="actions" stickyEnd>
        <div *ibCellDef="let data" ib-context-column>
          <button mat-icon-button (click)="handleView(data)">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
      </ib-column>

      <!-- <ib-footer>
        <ib-aggregate ibTableColumnName="number"></ib-aggregate>
      </ib-footer> -->
    </ib-kai-table>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        padding: 30px;
        gap: 3em;
      }

      ib-kai-table .ib-table {
        --ib-table-header-cell-color: lightgrey;
        --ib-table-header-cell-background-color: #309933;
      }
    `,
  ],
})
export class IbKaiTableFullExamplePage {
  @ViewChild(IbSelectionColumn, { static: true })
  selectionColumn: IbSelectionColumn;

  dataSource = new MatTableDataSource<any>();

  ngOnInit() {
    const users = Array.from({ length: 1000 }, (_, k) => createNewUser(k + 1));
    this.dataSource.data = users;
  }

  selectionChange(data) {
    console.log("selection change", data);
  }

  getSelection() {
    console.log("selection", this.selectionColumn?.selection.selected);
  }

  handleView(row) {
    console.log("handleView", row);
  }
}
