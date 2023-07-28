import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { TableView } from "../../store/views";

@Component({
  selector: "ib-table-view",
  templateUrl: "./table-view.component.html",
})
export class IbTableView implements OnInit {
  @Input() view: Readonly<TableView>;
  @Input() selected: boolean = false;
  @Input() dirty: boolean = false;
  @Output() ibRemoveView = new EventEmitter<TableView>();
  @Output() ibRenameView = new EventEmitter<TableView>();
  @Output() ibDuplicateView = new EventEmitter<TableView>();
  @Output() ibChangeView = new EventEmitter<TableView>();

  get isDefault() {
    return this.view.id === "__ibTableView__all";
  }

  constructor() {}

  ngOnInit() {}

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
}
