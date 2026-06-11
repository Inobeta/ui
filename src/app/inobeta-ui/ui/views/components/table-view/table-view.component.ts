import { Component, input, output } from "@angular/core";
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
  readonly view = input.required<IbViewSnapshot>();
  selected = input<boolean>(false);
  dirty = input<boolean>(false);
  ibRemoveView = output<IbViewSnapshot>();
  ibRenameView = output<IbViewSnapshot>();
  ibDuplicateView = output<IbViewSnapshot>();
  ibChangeView = output<IbViewSnapshot>();
}
