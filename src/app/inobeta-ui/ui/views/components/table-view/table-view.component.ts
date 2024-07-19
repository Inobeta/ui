import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IView } from "../../store/views/table-view";

@Component({
  selector: "ib-table-view",
  templateUrl: "./table-view.component.html",
})
export class IbTableView {
  @Input() view: Readonly<IView>;
  @Input() selected: boolean = false;
  @Input() dirty: boolean = false;
  @Output() ibRemoveView = new EventEmitter<IView>();
  @Output() ibRenameView = new EventEmitter<IView>();
  @Output() ibDuplicateView = new EventEmitter<IView>();
  @Output() ibChangeView = new EventEmitter<IView>();
}
