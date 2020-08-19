import {Component, EventEmitter, Input, Output, Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';

@Component({
  selector: 'ib-table-export-csv',
  template: `
    <div class="hover"
         (click)="open()"
         fxLayout="row"
         *ngIf="hasCsvExport"
         fxLayoutAlign="center center"
         style="cursor:pointer; border: 1px solid gray; border-radius: 20px; padding: 5px;padding-left: 10px;padding-right: 15px;">
      <i class="material-icons">call_made</i> {{ 'shared.ibTable.csv' | translate }}
    </div>
  `,
})
export class TableExportCsvComponent {
  @Input() hasCsvExport;
  @Output() exportCsv = new EventEmitter();

  constructor(public dialog: MatDialog) { }

  open() {
    const dialog = this.dialog.open(TableExportDialogComponent, {
      width: '400px',
    });

    dialog.afterClosed().subscribe(result => this.exportCsv.emit(result));
  }
}

@Component({
  selector: 'ib-table-export-dialog',
  template: `
    <h1 mat-dialog-title>Export</h1>
    <mat-dialog-content>
      <div>
        <mat-form-field>
          <mat-label>Formato</mat-label>
          <mat-select [(ngModel)]="format">
            <mat-option *ngFor="let format of formats" [value]="format.value">
              {{format.viewValue}}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <mat-radio-group [(ngModel)]="dataset" style="display:flex;flex-direction:column;margin: 15px 0;">
        <mat-radio-button value="current" style="margin: 4px">Pagina Corrente</mat-radio-button>
        <mat-radio-button value="all" style="margin: 4px">Tutti i dati</mat-radio-button>
      </mat-radio-group>

    </mat-dialog-content>
    <div mat-dialog-actions>
      <button mat-button (click)="onNoClick()">Cancel</button>
      <button mat-button [mat-dialog-close]="{ format: format, dataset: dataset }">Export</button>
    </div>
  `,
})
export class TableExportDialogComponent {
  format = 'csv';
  formats = [
    { value: 'csv', viewValue: 'CSV (Excel)' },
    { value: 'pdf', viewValue: 'PDF' }
  ];
  dataset = 'current';

  constructor(public dialogRef: MatDialogRef<TableExportDialogComponent>) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
