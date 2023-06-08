import { Component, ViewChild } from "@angular/core";
import { MatMenuTrigger } from "@angular/material/menu";

@Component({
  selector: "ib-filter-button",
  templateUrl: "filter-button.component.html",
})
export class IbFilterButton {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  closeMenu() {
    this.trigger.closeMenu();
  }
}
