import { Component, computed, contentChild, ViewChild } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule, MatMenuTrigger } from "@angular/material/menu";
import { IbFilterValueDirective } from "../filter-value.directive";

@Component({
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  selector: "ib-filter-button",
  templateUrl: "filter-button.component.html"
})
export class IbFilterButton {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  value = contentChild(IbFilterValueDirective);

  closeMenu() {
    this.trigger.closeMenu();
  }

  buttonStyle = computed(() => {
    console.log(this.value());
    if (!this.value()) {
      return "outlined";
    } else {
      return "filled";
    }
  })
}

