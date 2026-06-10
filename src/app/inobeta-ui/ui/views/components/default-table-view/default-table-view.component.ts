import { Component, EventEmitter, Input, Output } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { TranslateModule } from "@ngx-translate/core";

@Component({
  selector: "ib-default-table-view",
  templateUrl: "default-table-view.component.html",
  standalone: true,
  imports: [MatButtonModule, MatIconModule, TranslateModule]
})
export class IbDefaultTableView {
  @Input() selected: boolean = false;
  @Output() ibChangeView = new EventEmitter();
}
