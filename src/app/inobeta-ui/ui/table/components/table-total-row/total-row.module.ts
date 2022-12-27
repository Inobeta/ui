import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IbTableTotalRowComponent } from './table-total-row.component';
import { IbTableTotalRowApplyDialogComponent } from './table-total-row-apply-dialog.component';
import { IbTableTotalRowCellDirective, IbTotalRowDefaultCellComponent } from './cells/ib-total-row-default-cell/ib-total-row-default-cell.component';
import { IbTotalRowAddCellComponent } from './cells/ib-total-row-add-cell/ib-total-row-add-cell.component';
import { IbTotalRowAvgCellComponent } from './cells/ib-total-row-avg-cell/ib-total-row-avg-cell.component';
import { IbTotalRowBaseCellComponent } from './cells/ib-total-row-base-cell/ib-total-row-base-cell.component';
import { IbTotalRowSumCellComponent } from './cells/ib-total-row-sum-cell/total-row-sum-cell.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { IbStickyAreaModule } from '../../directives/sticky-area/sticky-area.module';

@NgModule({
  declarations: [
    IbTableTotalRowComponent,
    IbTableTotalRowApplyDialogComponent,
    IbTableTotalRowCellDirective,
    IbTotalRowSumCellComponent,
    IbTotalRowDefaultCellComponent,
    IbTotalRowAddCellComponent,
    IbTotalRowAvgCellComponent,
    IbTotalRowBaseCellComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule.forChild({
      extend: true
    }),
    MatDialogModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    IbStickyAreaModule
  ],
  exports: [
    IbTableTotalRowComponent,
    IbTableTotalRowApplyDialogComponent,
    IbTableTotalRowCellDirective,
    IbTotalRowSumCellComponent,
    IbTotalRowDefaultCellComponent,
    IbTotalRowAddCellComponent,
    IbTotalRowAvgCellComponent,
    IbTotalRowBaseCellComponent
  ]
})
export class TotalRowModule { }
