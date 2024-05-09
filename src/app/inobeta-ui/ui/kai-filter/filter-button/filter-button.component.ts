import { Component, ViewChild } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule, MatMenuTrigger } from "@angular/material/menu";

@Component({
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule
  ],
  selector: "ib-filter-button",
  templateUrl: "filter-button.component.html",
})
export class IbFilterButton {
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;

  closeMenu() {
    this.trigger.closeMenu();
  }
}
