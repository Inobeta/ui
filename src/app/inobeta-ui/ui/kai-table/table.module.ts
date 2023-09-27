import { PortalModule } from "@angular/cdk/portal";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import {
  MatPaginatorIntl,
  MatPaginatorModule,
} from "@angular/material/paginator";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { ibMatPaginatorTranslate } from "../table";
import { IbCellDirective, IbContextActionCell } from "./cells";
import { IbKaiRowGroupDirective } from "./rowgroup";
import { IbSelectionColumn } from "./columns/selection-column";
import { IbSortHeader } from "./sort-header";
import { IbTable } from "./table.component";
import { IbTextColumn } from "./columns/text-column";
import { IbColumn } from "./columns/column";
import { IbNumberColumn } from "./columns/number-column";
import { IbDateColumn } from "./columns/date-column";

@NgModule({
  exports: [
    IbTable,
    IbKaiRowGroupDirective,
    IbCellDirective,
    IbSelectionColumn,
    IbColumn,
    IbTextColumn,
    IbNumberColumn,
    IbDateColumn,
    IbSortHeader,
  ],
  declarations: [
    IbTable,
    IbContextActionCell,
    IbKaiRowGroupDirective,
    IbCellDirective,
    IbSelectionColumn,
    IbColumn,
    IbTextColumn,
    IbNumberColumn,
    IbDateColumn,
    IbSortHeader,
  ],
  imports: [
    CommonModule,
    PortalModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatProgressBarModule,
    TranslateModule.forChild({
      extend: true,
    }),
  ],
  providers: [
    {
      provide: MatPaginatorIntl,
      deps: [TranslateService],
      useFactory: ibMatPaginatorTranslate,
    },
  ],
})
export class IbKaiTableModule {}
