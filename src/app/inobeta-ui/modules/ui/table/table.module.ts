import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule, MatSortModule, MatChipsModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatIconModule, MatDialogModule, MatSelectModule, MatRadioModule, MatPaginatorModule, MatButtonModule, MatSnackBarModule, MatCardModule } from '@angular/material';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TableAddComponent } from './components/table-add.component';
import { TableExportDialogComponent, TableExportComponent } from './components/table-export.component';
import { TableFilterResetComponent } from './components/table-filter-reset.component';
import { TableHeaderComponent } from './components/table-header/table-header.component';
import { TableMenuActionsComponent } from './components/table-menu-actions.component';
import { TablePaginatorComponent } from './components/table-paginator.component';
import { TableRowsComponent } from './components/table-rows/table-rows.component';
import { TableSeachComponent } from './components/table-seach.component';
import { TableHeaderPopupComponent } from './components/tableHeaderPopup.component';
import { TableComponent } from './table.component';

const COMPONENTS = [
    TableComponent,
    TableHeaderComponent,
    TableRowsComponent,
    TableAddComponent,
    TableExportComponent,
    TableFilterResetComponent,
    TableMenuActionsComponent,
    TablePaginatorComponent,
    TableSeachComponent,
    TableHeaderPopupComponent,
    TableExportDialogComponent
]

@NgModule({
    declarations: [
        ...COMPONENTS,
        TableExportDialogComponent
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
       // RouterModule,
        TranslateModule.forChild({
            extend: true
        })
    ],
    exports: [...COMPONENTS],
    entryComponents: [
      TableExportDialogComponent
    ]
})
export class TableModule { }
