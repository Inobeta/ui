import { Component, ChangeDetectionStrategy } from "@angular/core";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { TranslatePipe } from "@ngx-translate/core";
import { IbKaiTableModule } from "public_api";
import { IbUserExample, createNewUser } from "./users";

type IbParentHeightDatasetMode = "small" | "large";

@Component({
  selector: "ib-kai-table-parent-height-example",
  standalone: true,
  imports: [IbKaiTableModule, MatButtonToggleModule, TranslatePipe],
  templateUrl: "./kai-table-parent-height-example.html",
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: "./kai-table-parent-height-example.scss",
})
export class IbKaiTableParentHeightExamplePage {
  readonly displayedColumns = ["name", "fruit", "number", "created_at"];
  readonly largeData: IbUserExample[] = Array.from({ length: 1000 }, (_, index) =>
    createNewUser(index + 1)
  );
  readonly smallData: IbUserExample[] = this.largeData.slice(0, 5);

  data: IbUserExample[] = this.smallData;
  datasetMode: IbParentHeightDatasetMode = "small";

  selectDataset(mode: IbParentHeightDatasetMode): void {
    this.datasetMode = mode;
    this.data = mode === "small" ? this.smallData : this.largeData;
  }
}
