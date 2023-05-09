import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IbTable } from "./table.component";
import { PortalModule } from "@angular/cdk/portal";
import { MatSortModule } from "@angular/material/sort";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { MatIconModule } from "@angular/material/icon";
import {
  MatPaginatorIntl,
  MatPaginatorModule,
} from "@angular/material/paginator";
import { IbContextActionCell } from "./cells";
import { MatTableModule } from "@angular/material/table";
import { MatButtonModule } from "@angular/material/button";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { ibMatPaginatorTranslate } from "../table";
import { IbKaiRowGroupDirective } from "./rowgroup";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { IbSelectionColumn } from "./selection-column";

@NgModule({
  exports: [IbTable, IbKaiRowGroupDirective, IbSelectionColumn],
  declarations: [
    IbTable,
    IbContextActionCell,
    IbKaiRowGroupDirective,
    IbSelectionColumn,
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
