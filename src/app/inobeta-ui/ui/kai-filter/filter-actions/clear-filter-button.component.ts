import { Component, Input } from "@angular/core";

@Component({
  selector: "ib-clear-filter-button",
  template: `<button mat-button [disabled]="disabled">
  {{ "shared.ibFilter.clear" | translate }}
</button>`,
})
export class IbClearFilterButton {
  @Input() disabled: boolean;
}
