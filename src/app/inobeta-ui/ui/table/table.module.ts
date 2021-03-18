import { CommonModule } from '@angular/common';
import { Injectable, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule, MatSortModule, MatChipsModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatIconModule, MatDialogModule, MatSelectModule, MatRadioModule, MatPaginatorModule, MatButtonModule, MatSnackBarModule, MatCardModule } from '@angular/material';
import { MissingTranslationHandler, MissingTranslationHandlerParams, TranslateModule } from '@ngx-translate/core';
import { IbTableExportDialogComponent, IbTableExportComponent } from './components/table-export.component';
import { IbTableHeaderComponent } from './components/table-header/table-header.component';
import { IbTablePaginatorComponent } from './components/table-paginator.component';
import { IbTableHeaderPopupComponent } from './components/table-header-popup.component';
import { IbTableComponent } from './table.component';
import { IbTableRowComponent } from './components/table-row.component';
import { IbTableActionsComponent } from './components/table-actions.component';
import { IbTableButtonComponent } from './components/table-button.component';
import { IbTableHeaderFilterComponent } from './components/table-header-filter-component';


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
        TranslateModule.forChild({
            extend: true
        })
    ],
    exports: [...COMPONENTS],
    entryComponents: [
      IbTableExportDialogComponent
    ]
})
export class IbTableModule { }

