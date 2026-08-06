import { Component, ChangeDetectionStrategy } from "@angular/core";
import { IB_AGGREGATE, IbKaiTableModule, IbTableLocalDataSource } from "public_api";
import { IbUserExample, createNewUser } from "./users";

@Component({
  selector: "ib-kai-table-custom-aggregate-example",
  standalone: true,
  imports: [IbKaiTableModule],
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
  providers: [
    {
      provide: IB_AGGREGATE,
      useValue: [
        {
          id: "max",
          name: "Massimo",
          label: "Massimo",
          type: "number",
          aggregateData: (values: any[]) => Math.max(...values.filter((v) => v != null)),
        },
      ],
    },
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <ib-kai-table tableName="customAggregate" [dataSource]="dataSource" [displayedColumns]="displayedColumns">
      <ib-text-column headerText="Name" name="name"></ib-text-column>
      <ib-text-column headerText="Fruit" name="fruit"></ib-text-column>
      <ib-number-column headerText="Amount" name="amount" aggregate></ib-number-column>
    </ib-kai-table>
  `,
})
export class IbKaiTableCustomAggregateExamplePage {
  dataSource = new IbTableLocalDataSource<IbUserExample>(
    Array.from({ length: 50 }, (_, k) => createNewUser(k + 1))
  );

  displayedColumns = ["name", "fruit", "amount"];
}
