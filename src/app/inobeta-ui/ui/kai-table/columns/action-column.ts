import { Directive } from "@angular/core";
import { IbColumn } from "./column";

@Directive({
  selector: "[ib-action-column]",
})
export class IbActionColumn {
  constructor(public ibColumn: IbColumn<unknown>) {
    this.ibColumn.name = "ib-action";
  }

  ngOnInit() {
    if (!this.ibColumn) {
      return;
    }

    if (!this.ibColumn._table) {
      return;
    }

    this.ibColumn.headerText = "";
    this.ibColumn._table.displayedColumns.push("ib-action")
  }
}