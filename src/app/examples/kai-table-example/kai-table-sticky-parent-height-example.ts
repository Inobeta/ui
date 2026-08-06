import { Component, ChangeDetectionStrategy } from "@angular/core";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { TranslatePipe } from "@ngx-translate/core";
import { IbKaiTableModule } from "public_api";
import { IbUserExample, createNewUser } from "./users";

type IbStickyParentDatasetMode = "small" | "large";

@Component({
  selector: "ib-kai-table-sticky-parent-height-example",
  standalone: true,
  imports: [IbKaiTableModule, MatButtonToggleModule, TranslatePipe],
  templateUrl: "./kai-table-sticky-parent-height-example.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: "./kai-table-sticky-parent-height-example.scss",
})
export class IbKaiTableStickyParentExamplePage {
  readonly displayedColumns = [
    "id",
    "name",
    "fruit",
    "amount",
    "number",
    "created_at",
    "subscribed",
  ];
  readonly largeData: IbUserExample[] = Array.from({ length: 1000 }, (_, index) =>
    createNewUser(index + 1)
  );
  readonly smallData: IbUserExample[] = this.largeData.slice(0, 5);

  data: IbUserExample[] = this.smallData;
  datasetMode: IbStickyParentDatasetMode = "small";

  selectDataset(mode: IbStickyParentDatasetMode): void {
    this.datasetMode = mode;
    this.data = mode === "small" ? this.smallData : this.largeData;
  }
}
