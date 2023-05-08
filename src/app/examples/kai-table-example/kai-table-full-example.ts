import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import {
  useColumn,
  useContextColumn,
} from "src/app/inobeta-ui/ui/kai-table/cells";
import { IbTable } from "src/app/inobeta-ui/ui/kai-table/table.component";
import { createNewUser } from "./users";
import { IbSelectionColumn } from "src/app/inobeta-ui/ui/kai-table/selection-column";

@Component({
  selector: "ib-kai-table-full-example",
  template: `
    <button
      (click)="getSelection()"
      [disabled]="selectionColumn.selection.selected.length === 0"
      mat-raised-button
    >
      get selection
    </button>
    <ib-kai-table #table [dataSource]="dataSource" [columns]="columns">
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

  dataSource = new MatTableDataSource<any>();
  columns = [
    useColumn("name"),
    useColumn("fruit"),
    useColumn("number", "number", true),
    useContextColumn(() => [{ type: "view", icon: "chevron_right" }]),
  ];

  ngOnInit() {
    const users = Array.from({ length: 1000 }, (_, k) =>
      createNewUser(k + 1)
    ).map((u) => ({ ...u, select: false }));
    this.dataSource.data = users;
    console.log(new Set(users.map((u) => u.fruit)));
  }

  selectionChange(data) {
    console.log("selection change", data);
  }

  getSelection() {
    console.log("selection", this.selectionColumn.selection.selected);
  }
}
