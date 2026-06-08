import { Component } from "@angular/core";
import { IbFilterModule, IbKaiTableModule } from "public_api";
import { IbUserExample, createNewUser } from "./users";

@Component({
  selector: "ib-kai-table-custom-sort-filter-example",
  template: `
    <ib-kai-table [data]="data" [displayedColumns]="displayedColumns">
      <ib-filter>
        <ib-search-bar />
        <ib-boolean-filter name="isSummerFruit">Frutta estiva</ib-boolean-filter>
      </ib-filter>

      <ib-text-column headerText="Name (sortable by pattern '%w.')" name="name" sort [sortingDataAccessor]="customNameSortingAccessor"></ib-text-column>
      <ib-text-column headerText="Fruit" name="fruit" sort></ib-text-column>
      <ib-number-column headerText="Amount" name="amount" sort></ib-number-column>
      <ib-text-column name="isSummerFruit" [filterDataAccessor]="seasonFilterAccessor"></ib-text-column>
    </ib-kai-table>
  `,
  standalone: true,
  imports: [IbKaiTableModule, IbFilterModule],
  styles: [`:host { display: flex; flex-direction: column; padding: 30px; }`],
})
export class IbKaiTableCustomSortFilterExamplePage {
  data: IbUserExample[] = Array.from({ length: 50 }, (_, k) => createNewUser(k + 1));
  displayedColumns = ["name", "fruit", "amount"];

  seasonFilterAccessor = (data: IbUserExample): any => {
    const summerFruits = ["peach", "watermelon", "melon", "mango", "pineapple", "lychee"];
    const winterFruits = ["orange", "pear", "kiwi", "pomegranate", "apple", "banana", "lime", "blueberry"];

    const fruit = (data.fruit ?? "").toLowerCase().trim();

    if (summerFruits.includes(fruit)) {
      return true;
    }

    if (winterFruits.includes(fruit)) {
      return false;
    }

    return false;
  };

  // custom sorting accessor for the 'name' column. Returns a comparable key used by the table
  customNameSortingAccessor = (data: IbUserExample, name: string) => {
    const fullName = data?.name ?? "";
    const parts = fullName.trim().split(/\s+/);
    const last = parts.length > 1 ? parts[parts.length - 1] : parts[0];
    return (last.charAt(0) || "").toLowerCase();
  };
}
