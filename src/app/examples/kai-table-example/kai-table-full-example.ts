import { Component, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import {
  useColumn,
  useContextColumn,
  useDateColumn,
} from "src/app/inobeta-ui/ui/kai-table/cells";
import { IbSelectionColumn } from "src/app/inobeta-ui/ui/kai-table/selection-column";
import { IbTable } from "src/app/inobeta-ui/ui/kai-table/table.component";
import { createNewUser } from "./users";

@Component({
  selector: "ib-kai-table-full-example",
  template: `
    <div style="display: flex; gap: 12px">
      <button
        (click)="getSelection()"
        [disabled]="selectionColumn?.selection.selected.length === 0"
        mat-raised-button
      >
        get selection
      </button>
    </div>
    <ib-kai-table #table [columns]="columns" [dataSource]="dataSource">
      <ib-filter [value]="filterValue">
        <ib-search-bar></ib-search-bar>

        <ib-text-filter ibTableColumnName="name">Name</ib-text-filter>
        <ib-tag-filter ibTableColumnName="fruit">Fruit</ib-tag-filter>
        <ib-number-filter ibTableColumnName="number">Amount</ib-number-filter>
        <ib-filter-date ibTableColumnName="aDate">Purchased</ib-filter-date>
      </ib-filter>
      <ib-selection-column
        (ibRowSelectionChange)="selectionChange($event)"
      ></ib-selection-column>
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
  @ViewChild("table", { static: true }) kaiTable: IbTable;
  @ViewChild(IbSelectionColumn, { static: true })
  selectionColumn: IbSelectionColumn;

  filterValue = { fruit: ["apple", "banana"], number: { min: 5, max: 10 } };
  dataSource = new MatTableDataSource<any>();
  columns = [
    useColumn("Name", "name"),
    useColumn("Fruit", "fruit"),
    useColumn("Amount", "number", true),
    useDateColumn("Purchased", "aDate", true),
    useContextColumn(() => [{ type: "view", icon: "chevron_right" }]),
  ];

  ngOnInit() {
    const users = Array.from({ length: 1000 }, (_, k) =>
      createNewUser(k + 1)
    ).map((u) => ({ ...u, select: false }));
    this.dataSource.data = users;
  }

  selectionChange(data) {
    console.log("selection change", data);
  }

  getSelection() {
    console.log("selection", this.selectionColumn?.selection.selected);
  }
}
