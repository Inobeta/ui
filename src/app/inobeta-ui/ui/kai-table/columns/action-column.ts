import { Directive } from "@angular/core";
import { IbColumn } from "./column";

@Directive({
  selector: "[ib-action-column]",
  standalone: false
})
export class IbActionColumn {
  constructor(public ibColumn: IbColumn<unknown>) {
    this.ibColumn.name.set("ib-action");
  }

  ngOnInit() {
    this.ibColumn.headerText.set("");
  }
}
