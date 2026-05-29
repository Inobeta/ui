import { Component } from "@angular/core";
import { IbKaiTableModule } from "public_api";
import { IB_COLUMN_OPTIONS } from "../../inobeta-ui/ui/kai-table/tokens";
import { IbTableDataSource } from "../../inobeta-ui/ui/kai-table/table-data-source";
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
    <ib-kai-table [dataSource]="dataSource" [displayedColumns]="displayedColumns">
      <ib-text-column name="name"></ib-text-column>
      <ib-text-column name="fruit"></ib-text-column>
      <ib-number-column name="amount"></ib-number-column>
      <ib-text-column name="created_at"></ib-text-column>
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
export class IbKaiTableColumnOptionsExamplePage {
  dataSource = new IbTableDataSource(
    Array.from({ length: 50 }, (_, k) => createNewUser(k + 1))
  );
  displayedColumns = ["name", "fruit", "amount", "created_at"];
}
