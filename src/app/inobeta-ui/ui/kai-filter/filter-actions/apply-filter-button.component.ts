import { Component } from "@angular/core";

@Component({
  selector: "ib-apply-filter-button",
  template: ` <button mat-button color="primary">
    {{ "shared.ibFilter.update" | translate }}
  </button>`,
})
export class IbApplyFilterButton {}
