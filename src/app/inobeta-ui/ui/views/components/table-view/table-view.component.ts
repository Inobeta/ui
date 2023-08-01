import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IView } from "../../store/views";

@Component({
  selector: "ib-table-view",
  templateUrl: "./table-view.component.html",
})
export class IbTableView {
  @Input() view: Readonly<IView>;
  @Input() selected: boolean = false;
  @Input() dirty: boolean = false;
  @Input() pinned: boolean = false;
  @Output() ibRemoveView = new EventEmitter<IView>();
  @Output() ibRenameView = new EventEmitter<IView>();
  @Output() ibDuplicateView = new EventEmitter<IView>();
  @Output() ibChangeView = new EventEmitter<IView>();
  @Output() ibPinView = new EventEmitter<{
    view: IView;
    pinned: boolean;
  }>();

  handleRemoveView() {
    this.ibRemoveView.emit(this.view);
  }

  handleRenameView() {
    this.ibRenameView.emit(this.view);
  }

  handleDuplicateView() {
    this.ibDuplicateView.emit(this.view);
  }

  handleChangeView() {
    this.ibChangeView.emit(this.view);
  }

  handlePinView(pinned) {
    this.ibPinView.emit({
      view: this.view,
      pinned,
    });
  }
}
