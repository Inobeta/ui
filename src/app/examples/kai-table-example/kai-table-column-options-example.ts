import { Component } from "@angular/core";
import { IB_COLUMN_OPTIONS, IbKaiTableModule, IbTableLocalDataSource } from "public_api";
import { createNewUser } from "./users";

@Component({
  selector: "ib-kai-table-column-options-example",
  standalone: true,
  imports: [IbKaiTableModule],
  providers: [
    {
      provide: IB_COLUMN_OPTIONS,
      useValue: {
        defaultHeaderTextTransform: (name: string) =>
          name + " (transformed)",
        defaultDataAccessor: (data: any, name: string) => data[name] ?? "PLACEHOLDER FOR MISSING VALUE",
      },
    },
  ],
  template: `
    <ib-kai-table tableName="columnOptions" [dataSource]="dataSource" [displayedColumns]="displayedColumns">
      <ib-text-column name="name"></ib-text-column>
      <ib-text-column name="fruit"></ib-text-column>
      <ib-number-column name="amount"></ib-number-column>
      <ib-text-column name="created_at"></ib-text-column>
    </ib-kai-table>
  `,
  styles: [
    `
      :host {
        --ib-table-min-content-height: 0px;

        display: flex;
        flex: 1 1 auto;
        flex-direction: column;
        min-height: 0;
        overflow: hidden;
        padding: 30px;
      }

      ib-kai-table {
        flex: 1 1 auto;
        min-height: 0;
      }
    `,
  ],
})
export class IbKaiTableColumnOptionsExamplePage {
  dataSource = new IbTableLocalDataSource(
    Array.from({ length: 50 }, (_, k) => createNewUser(k + 1))
  );
  displayedColumns = ["name", "fruit", "amount", "created_at"];
}
