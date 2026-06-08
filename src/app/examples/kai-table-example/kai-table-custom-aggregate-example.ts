import { Component } from "@angular/core";
import { IbKaiTableModule } from "public_api";
import { IB_AGGREGATE } from "../../inobeta-ui/ui/kai-table/tokens";
import { IbUserExample, createNewUser } from "./users";

@Component({
  selector: "ib-kai-table-custom-aggregate-example",
  standalone: true,
  imports: [IbKaiTableModule],
  styles: [":host { display: flex; flex-direction: column; padding: 30px }"],
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
  template: `
    <ib-kai-table [data]="data" [displayedColumns]="displayedColumns">
      <ib-text-column headerText="Name" name="name"></ib-text-column>
      <ib-text-column headerText="Fruit" name="fruit"></ib-text-column>
      <ib-number-column headerText="Amount" name="amount" aggregate></ib-number-column>
    </ib-kai-table>
  `,
})
export class IbKaiTableCustomAggregateExamplePage {
  data = Array.from({ length: 50 }, (_, k) => createNewUser(k + 1));

  displayedColumns = ["name", "fruit", "amount"];
}
