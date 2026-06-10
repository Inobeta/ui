import { Component, EventEmitter, Input, Output } from "@angular/core";
import { IbDefaultTableView } from "../default-table-view/default-table-view.component";
import { IbTableView } from "../table-view/table-view.component";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { IbViewSnapshot } from "../../view.types";

@Component({
    selector: "ib-view-list",
    templateUrl: "./view-list.component.html",
    styleUrls: ["./view-list.component.scss"],
    standalone: true,
    imports: [IbDefaultTableView, IbTableView, MatButtonModule, MatIconModule]
})
export class IbViewList {
  @Input() defaultView: IbViewSnapshot;
  @Input() activeView: IbViewSnapshot;
  @Input() views: IbViewSnapshot[];
  @Input() dirty: boolean = false;

  @Output() ibAddView = new EventEmitter();
  @Output() ibRemoveView = new EventEmitter<IbViewSnapshot>();
  @Output() ibRenameView = new EventEmitter<IbViewSnapshot>();
  @Output() ibDuplicateView = new EventEmitter<IbViewSnapshot>();
  @Output() ibChangeView = new EventEmitter<IbViewSnapshot>();
}
