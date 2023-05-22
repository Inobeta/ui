import { Component, ViewChild } from "@angular/core";
import { IbFilterBase } from "../filters/base/filter-base";
import { MatMenuTrigger } from "@angular/material/menu";

@Component({
  selector: "ib-filter-button",
  templateUrl: "filter-button.component.html",
})
export class IbFilterButton {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  constructor(public filter: IbFilterBase) {}

  closeMenu() {
    this.trigger.closeMenu();
  }
}
