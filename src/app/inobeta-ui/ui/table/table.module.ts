import { CommonModule, registerLocaleData } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule, MatSortModule, MatChipsModule, MatCheckboxModule,
  MatFormFieldModule, MatInputModule, MatIconModule, MatDialogModule,
  MatSelectModule, MatRadioModule, MatPaginatorModule, MatButtonModule,
  MatSnackBarModule, MatCardModule, MatRippleModule, MatPaginatorIntl } from '@angular/material';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IbTableExportDialogComponent, IbTableExportComponent } from './components/table-export.component';
import { IbTableHeaderComponent } from './components/table-header/table-header.component';
import { IbTablePaginatorComponent } from './components/table-paginator.component';
import { IbTableHeaderPopupComponent } from './components/table-header-popup.component';
import { IbTableComponent } from './table.component';
import { IbTableRowComponent } from './components/table-row.component';
import { IbTableActionsComponent } from './components/table-actions.component';
import { IbTableButtonComponent } from './components/table-button.component';
import { IbTableHeaderFilterComponent } from './components/table-header-filter-component';
import localeIt from '@angular/common/locales/it';
import { IbModalModule } from '../modal/modal.module';
import { IbMatPaginatorI18n } from './material-intl/paginator.intl';
registerLocaleData(localeIt, 'it');

const COMPONENTS = [
    IbTableComponent,
    IbTableHeaderComponent,
    IbTableExportComponent,
    IbTablePaginatorComponent,
    IbTableHeaderPopupComponent,
    IbTableExportDialogComponent,
    IbTableRowComponent,
    IbTableActionsComponent,
    IbTableButtonComponent,
    IbTableHeaderFilterComponent
];

@NgModule({
    declarations: [
        ...COMPONENTS,
        IbTableExportDialogComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        MatMenuModule,
        MatSortModule,
        MatChipsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatDialogModule,
        MatSelectModule,
        MatRadioModule,
        MatPaginatorModule,
        MatButtonModule,
        MatSnackBarModule,
        MatCardModule,
        MatRippleModule,
        TranslateModule.forChild({
            extend: true
        }),
        IbModalModule
    ],
    exports: [...COMPONENTS],
    entryComponents: [
      IbTableExportDialogComponent
    ],
    providers: [
      {
        provide: MatPaginatorIntl, deps: [TranslateService],
        useFactory: (translateService: TranslateService) => new IbMatPaginatorI18n(translateService).getPaginatorIntl()
      }
    ]
})
export class IbTableModule { }

