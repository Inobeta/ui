import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule, MatSortModule, MatChipsModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatIconModule, MatDialogModule, MatSelectModule, MatRadioModule, MatPaginatorModule, MatButtonModule, MatSnackBarModule, MatCardModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { IbTableAddComponent } from './components/table-add.component';
import { IbTableExportDialogComponent, IbTableExportComponent } from './components/table-export.component';
import { IbTableFilterResetComponent } from './components/table-filter-reset.component';
import { IbTableHeaderComponent } from './components/table-header/table-header.component';
import { IbTableMenuActionsComponent } from './components/table-menu-actions.component';
import { IbTablePaginatorComponent } from './components/table-paginator.component';
import { IbTableRowsComponent } from './components/table-rows/table-rows.component';
import { IbTableSeachComponent } from './components/table-seach.component';
import { IbTableHeaderPopupComponent } from './components/tableHeaderPopup.component';
import { IbTableComponent } from './table.component';

const COMPONENTS = [
    IbTableComponent,
    IbTableHeaderComponent,
    IbTableRowsComponent,
    IbTableAddComponent,
    IbTableExportComponent,
    IbTableFilterResetComponent,
    IbTableMenuActionsComponent,
    IbTablePaginatorComponent,
    IbTableSeachComponent,
    IbTableHeaderPopupComponent,
    IbTableExportDialogComponent
]

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
