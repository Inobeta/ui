import { Component, ViewChild } from "@angular/core";
import { MatTableDataSource } from "@angular/material/table";
import {
  useColumn,
  useContextColumn,
  useDateColumn,
} from "src/app/inobeta-ui/ui/kai-table/cells";
import { IbSelectionColumn } from "src/app/inobeta-ui/ui/kai-table/selection-column";
import { createNewUser } from "./users";
import { IB_DATA_JSPDF_OPTIONS, IbDataExportService } from "src/app/inobeta-ui/ui/data-export/data-export.service";

@Component({
  selector: "ib-kai-table-full-example",
  template: `
    <ib-kai-table
      tableName="fullExample"
      [columns]="columns"
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
  providers: [{
    provide: IB_DATA_JSPDF_OPTIONS,
    useValue: { orientation: 'p',     compress: true,
  }
  }, IbDataExportService]
})
export class IbKaiTableFullExamplePage {
  @ViewChild(IbSelectionColumn, { static: true })
  selectionColumn: IbSelectionColumn;

  dataSource = new MatTableDataSource<any>();
  columns = [
    useColumn("Name", "name"),
    useColumn("Fruit", "fruit"),
    useColumn("Amount", "number", true),
    useDateColumn("Purchased", "aDate", true),
    useContextColumn(() => [{ type: "view", icon: "chevron_right" }]),
  ];

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
}
