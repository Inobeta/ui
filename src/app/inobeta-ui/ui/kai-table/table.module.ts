import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IbTable } from './table.component';
import { PortalModule } from '@angular/cdk/portal';
import { MatSortModule } from '@angular/material/sort';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { IbContextActionCell } from './cells';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
//FIXME: please move this into kai-table
import { ibMatPaginatorTranslate } from '../table';

@NgModule({
  exports: [
    IbTable,
  ],
  declarations: [
    IbTable,
    IbContextActionCell,
  ],
  imports: [
    CommonModule,
    PortalModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule.forChild({
      extend: true
    })
  ],
  providers: [
    {
      provide: MatPaginatorIntl, deps: [TranslateService],
      useFactory: ibMatPaginatorTranslate
    }]
})
export class IbKaiTableModule { }
