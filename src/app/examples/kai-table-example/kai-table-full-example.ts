import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import {
  useColumn,
  useContextColumn,
  useDateColumn,
} from "src/app/inobeta-ui/ui/kai-table/cells";
import { IbTable } from "src/app/inobeta-ui/ui/kai-table/table.component";
import { createNewUser } from "./users";
import { IbSelectionColumn } from "src/app/inobeta-ui/ui/kai-table/selection-column";

@Component({
  selector: "ib-kai-table-full-example",
  template: `
    <div style="display: flex; gap: 12px">
      <button
        (click)="getSelection()"
        [disabled]="selectionColumn.selection.selected.length === 0"
        mat-raised-button
      >
        get selection
      </button>
    </div>
    <ib-kai-table #table [dataSource]="dataSource" [columns]="columns">
      <ib-filter [value]="initialValue">
        <ib-filter-text ibTableColumnName="name">Name</ib-filter-text>
        <ib-filter-tag ibTableColumnName="fruit">Fruit</ib-filter-tag>
        <ib-filter-number ibTableColumnName="number">Amount</ib-filter-number>
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

  initialValue = { fruit: ["apple", "banana"], number: { min: 5, max: 10 } };
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
    console.log("selection", this.selectionColumn.selection.selected);
  }
}
