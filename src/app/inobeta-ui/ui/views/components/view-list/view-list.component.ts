import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IView } from "../../store/views/table-view";

@Component({
  selector: "ib-view-list",
  templateUrl: "./view-list.component.html",
  styleUrls: ["./view-list.component.scss"],
})
export class IbViewList {
  @Input() defaultView: IView;
  @Input() activeView: IView;
  @Input() views: IView[];
  @Input() dirty: boolean = false;

  @Output() ibAddView = new EventEmitter();
  @Output() ibRemoveView = new EventEmitter<IView>();
  @Output() ibRenameView = new EventEmitter<IView>();
  @Output() ibDuplicateView = new EventEmitter<IView>();
  @Output() ibChangeView = new EventEmitter<IView>();
}
