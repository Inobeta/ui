import { Component, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import { IbSelectionColumn } from "../../inobeta-ui/ui/kai-table/columns/selection-column";
import { createNewUser } from "./users";

@Component({
  selector: "ib-kai-table-full-example",
  template: `
    <ib-kai-table
      tableName="fullExample"
      [displayedColumns]="columns"
      [dataSource]="dataSource"
    >
      <ib-table-action-group>
        <button
          mat-icon-button
          (click)="getSelection()"
          *ngIf="selectionColumn?.selection.selected.length > 0"
        >
          <mat-icon>delete</mat-icon>
        </button>
        <ib-table-data-export-action></ib-table-data-export-action>
      </ib-table-action-group>

      <ib-table-view-group></ib-table-view-group>
      <ib-filter>
        <ib-search-bar></ib-search-bar>

        <ib-text-filter name="name">Name</ib-text-filter>
        <ib-tag-filter name="fruit">Fruit</ib-tag-filter>
        <ib-number-filter name="number">Amount</ib-number-filter>
        <ib-date-filter name="aDate">Purchased</ib-date-filter>
      </ib-filter>

      <ib-selection-column
        (ibRowSelectionChange)="selectionChange($event)"
      ></ib-selection-column>
      <ib-text-column
        headerText="Name"
        name="name"
        aggregate
        sort
      ></ib-text-column>
      <ib-text-column headerText="Fruit" name="fruit" sort></ib-text-column>
      <ib-number-column
        headerText="Amount"
        name="number"
        aggregate
        sort
      ></ib-number-column>
      <ib-date-column headerText="Purchased" name="aDate" sort></ib-date-column>
      <ib-column name="subscribed" sort>
        <section *ibCellDef="let element">
          <mat-icon [color]="element.subscribed ? 'accent' : ''">{{
            element.subscribed ? "done" : "close"
          }}</mat-icon>
        </section>
      </ib-column>
      <ib-column ib-action-column>
        <section *ibCellDef="let element">
          <button mat-icon-button (click)="handleView(element)">
            <mat-icon>chevron_right</mat-icon>
          </button>
        </section>
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
  columns = ["name", "fruit", "number", "aDate", "subscribed"];

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
