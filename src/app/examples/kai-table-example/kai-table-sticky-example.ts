import { Component } from "@angular/core";
import { IbKaiTableModule } from "public_api";
import { IbUserExample, createNewUser } from "./users";

@Component({
  selector: "ib-kai-table-sticky-example",
  standalone: true,
  imports: [IbKaiTableModule],
  template: `
    <ib-kai-table
      [data]="data"
      [displayedColumns]="displayedColumns"
      [style.max-width]="'600px'"
    >
      <ib-text-column headerText="ID" name="id" sort></ib-text-column>
      <ib-text-column headerText="Name" name="name" sticky sort></ib-text-column>
      <ib-text-column headerText="Fruit" name="fruit" sort></ib-text-column>
      <ib-number-column headerText="Amount" name="amount" sort></ib-number-column>
      <ib-number-column headerText="Number" name="number" sort></ib-number-column>
      <ib-date-column headerText="Created At" name="created_at" sort></ib-date-column>
      <ib-text-column headerText="Subscribed" name="subscribed" stickyEnd sort></ib-text-column>
    </ib-kai-table>
  `,
  styles: [
    `:host { display: block; overflow-x: auto; padding: 30px; }`,
  ],
})
export class IbKaiTableStickyExamplePage {
  data: IbUserExample[] = Array.from({ length: 30 }, (_, k) =>
    createNewUser(k + 1)
  );

  displayedColumns = [
    "id",
    "name",
    "fruit",
    "amount",
    "number",
    "created_at",
    "subscribed",
  ];
}
