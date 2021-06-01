import { CommonModule, registerLocaleData } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
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
import { StoreModule } from '@ngrx/store';
import { ibTableFiltersReducer } from './redux/table.reducer';
registerLocaleData(localeIt, 'it');

export function ibMatPaginatorTranslate(translateService: TranslateService) {
  return new IbMatPaginatorI18n(translateService).getPaginatorIntl();
}


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
        IbModalModule,
        StoreModule.forFeature('tableFiltersState', ibTableFiltersReducer),
    ],
    exports: [...COMPONENTS],
    providers: [
      {
        provide: MatPaginatorIntl, deps: [TranslateService],
        useFactory: ibMatPaginatorTranslate
      }
    ]
})
export class IbTableModule { }

