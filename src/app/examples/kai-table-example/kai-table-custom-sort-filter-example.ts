import { Component, OnInit } from "@angular/core";
import { Sort } from "@angular/material/sort";
import { IbFilterModule, IbKaiTableModule, IbTableLocalDataSource } from "public_api";
import { IbUserExample, createNewUser } from "./users";

@Component({
  selector: "ib-kai-table-custom-sort-filter-example",
  template: `
    <ib-kai-table tableName="customSortFilter" [dataSource]="dataSource" [displayedColumns]="displayedColumns">
      <ib-filter>
        <ib-search-bar />
        <ib-boolean-filter name="isSummerFruit">Frutta estiva</ib-boolean-filter>
      </ib-filter>

      <ib-text-column headerText="Name (sortable by pattern '%w.')" name="name" sort></ib-text-column>
      <ib-text-column headerText="Fruit" name="fruit" sort></ib-text-column>
      <ib-number-column headerText="Amount" name="amount" sort></ib-number-column>
      <ib-text-column name="isSummerFruit" [filterDataAccessor]="seasonFilterAccessor"></ib-text-column>
    </ib-kai-table>
  `,
  standalone: true,
  imports: [IbKaiTableModule, IbFilterModule],
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
export class IbKaiTableCustomSortFilterExamplePage implements OnInit {
  private readonly data = Array.from({ length: 50 }, (_, k) => createNewUser(k + 1));

  dataSource = new IbTableLocalDataSource<IbUserExample>(this.data);
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

  ngOnInit() {
    const defaultSort = this.dataSource.sortData.bind(this.dataSource);
    this.dataSource.sortData = (data: IbUserExample[], sort: Sort): IbUserExample[] => {
      if (!sort?.active || !sort?.direction) {
        return data;
      }

      if (sort.active !== "name") {
        return defaultSort(data, sort);
      }

      const isAsc = sort.direction === "asc";
      const getInitial = (fullName: string) => {
        if (!fullName) return "";
        const parts = fullName.trim().split(/\s+/);
        // assume last part is the initial like "A." -> take first char
        const last = parts.length > 1 ? parts[parts.length - 1] : parts[0];
        return (last.charAt(0) || "").toLowerCase();
      };

      return data.slice().sort((a, b) => {
        const aInit = getInitial(a.name ?? "");
        const bInit = getInitial(b.name ?? "");
        const result = aInit.localeCompare(bInit);
        return isAsc ? result : -result;
      });
    };
  }
}
