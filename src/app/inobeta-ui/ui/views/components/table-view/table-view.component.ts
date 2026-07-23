import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IView } from "../../view.types";

@Component({
    selector: "ib-table-view",
    templateUrl: "./table-view.component.html",
    standalone: false
})
export class IbTableView {
  @Input() view!: Readonly<IView>;
  @Input() selected = false;
  @Input() dirty = false;
  @Output() ibRemoveView = new EventEmitter<IView>();
  @Output() ibRenameView = new EventEmitter<IView>();
  @Output() ibDuplicateView = new EventEmitter<IView>();
  @Output() ibChangeView = new EventEmitter<IView>();
}
