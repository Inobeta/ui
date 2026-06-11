import { Component, EventEmitter, input, Input, output, Output } from "@angular/core";
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
  defaultView = input.required<IbViewSnapshot>();
  activeView = input<IbViewSnapshot>();
  views = input<IbViewSnapshot[]>([]);
  dirty = input<boolean>(false);

  ibAddView = output();
  ibRemoveView = output<IbViewSnapshot>();
  ibRenameView = output<IbViewSnapshot>();
  ibDuplicateView = output<IbViewSnapshot>();
  ibChangeView = output<IbViewSnapshot>();
}
