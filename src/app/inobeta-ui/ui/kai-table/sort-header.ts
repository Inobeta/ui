import { Directive, Input } from "@angular/core";
import { MatSort, MatSortHeader } from "@angular/material/sort";

@Directive({ selector: "[ib-sort-header-for], [ibSortHeaderFor]" })
export class IbSortHeader {
  @Input("ibSortHeaderFor") set matSort(matSort: MatSort) {
    this.matSortHeader._sort = matSort;
    this.matSortHeader["_handleStateChanges"]();
  }

  constructor(public matSortHeader: MatSortHeader) {}
}
