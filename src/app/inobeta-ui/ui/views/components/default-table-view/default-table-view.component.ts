import { Component, EventEmitter, Input, Output } from "@angular/core";

@Component({
    selector: "ib-default-table-view",
    templateUrl: "default-table-view.component.html",
    standalone: false
})
export class IbDefaultTableView {
  @Input() selected: boolean = false;
  @Output() ibChangeView = new EventEmitter();
}
