import { Component, computed, contentChild, inject, ViewChild } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule, MatMenuTrigger } from "@angular/material/menu";
import { IbFilterValueDirective } from "../filter-value.directive";
import { FilterOverlayService } from "./filter-overlay.service";

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
  @ViewChild(MatMenuTrigger) trigger?: MatMenuTrigger;
  value = contentChild(IbFilterValueDirective);

  overlay = inject(FilterOverlayService);

  closeMenu() {
    this.overlay.requestClose();
  }

  constructor() {
    this.overlay.closeRequested.subscribe(() => {
      this.trigger?.closeMenu();
    });
  }
  buttonStyle = computed(() => {
    if (!this.value()) {
      return "outlined";
    } else {
      return "filled";
    }
  })
}

