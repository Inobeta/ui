import { PortalModule } from "@angular/cdk/portal";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatIconModule } from "@angular/material/icon";
import {
  MatPaginatorIntl,
  MatPaginatorModule
} from "@angular/material/paginator";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { ibMatPaginatorTranslate } from "../table";
import { IbContextActionCell } from "./cells";
import { IbKaiRowGroupDirective } from "./rowgroup";
import { IbSelectionColumn } from "./selection-column";
import { IbTable } from "./table.component";

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
export class IbKaiTableModule { }
