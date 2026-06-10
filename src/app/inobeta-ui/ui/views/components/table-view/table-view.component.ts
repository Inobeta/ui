import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { TranslateModule } from "@ngx-translate/core";
import { IbViewSnapshot } from "../../view.types";

@Component({
  selector: "ib-table-view",
  templateUrl: "./table-view.component.html",
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatMenuModule, MatTooltipModule, TranslateModule]
})
export class IbTableView {
  @Input() view: Readonly<IbViewSnapshot>;
  @Input() selected: boolean = false;
  @Input() dirty: boolean = false;
  @Output() ibRemoveView = new EventEmitter<IbViewSnapshot>();
  @Output() ibRenameView = new EventEmitter<IbViewSnapshot>();
  @Output() ibDuplicateView = new EventEmitter<IbViewSnapshot>();
  @Output() ibChangeView = new EventEmitter<IbViewSnapshot>();
}
