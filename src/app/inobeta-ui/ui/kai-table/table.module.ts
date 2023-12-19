import { PortalModule } from "@angular/cdk/portal";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import {
  MatPaginatorIntl,
  MatPaginatorModule,
} from "@angular/material/paginator";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { ibMatPaginatorTranslate } from "../table";
import {
  IbAggregateCell,
  IbAverageAggregateProvider,
  IbCellDef,
  IbSumAggregateProvider,
} from "./cells";
import { IbActionColumn } from "./columns/action-column";
import { IbColumn } from "./columns/column";
import { IbDateColumn } from "./columns/date-column";
import { IbNumberColumn } from "./columns/number-column";
import { IbSelectionColumn } from "./columns/selection-column";
import { IbTextColumn } from "./columns/text-column";
import { IbKaiRowGroupDirective } from "./rowgroup";
import { IbSortHeader } from "./sort-header";
import { IbTable } from "./table.component";

@NgModule({
  exports: [
    IbTable,
    IbKaiRowGroupDirective,
    IbCellDef,
    IbSelectionColumn,
    IbColumn,
    IbTextColumn,
    IbNumberColumn,
    IbDateColumn,
    IbSortHeader,
    IbActionColumn,
    IbAggregateCell,
  ],
  declarations: [
    IbTable,
    IbKaiRowGroupDirective,
    IbCellDef,
    IbSelectionColumn,
    IbTextColumn,
    IbNumberColumn,
    IbDateColumn,
    IbActionColumn,
    IbAggregateCell,
  ],
  imports: [
    CommonModule,
    PortalModule,
    IbColumn,
    IbSortHeader,
    MatTableModule,
    MatSortModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatPaginatorModule,
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
    IbSumAggregateProvider,
    IbAverageAggregateProvider,
  ],
})
export class IbKaiTableModule {}
