import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from "@angular/core";

@Component({
    selector: "ib-default-table-view",
    templateUrl: "default-table-view.component.html",
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false
})
export class IbDefaultTableView {
  @Input() selected: boolean = false;
  @Output() ibChangeView = new EventEmitter();
}
