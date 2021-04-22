import {Component, EventEmitter, Input, Output, Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';

@Component({
  selector: 'ib-table-export',
  template: `
  <ib-table-button
    (click)="open()"
    label="shared.ibTable.export"
    color="basic"
  ></ib-table-button>
  `,
})
export class IbTableExportComponent {
  @Input() selectableRows = false
  @Output() export = new EventEmitter();

  data = {
    base: {},
    form: {}
  }

  constructor(public dialog: MatDialog) { }

  open() {
    const dialog = this.dialog.open(IbTableExportDialogComponent, {
      width: '400px',
      data: {
        selectableRows: this.selectableRows
      }
    });

    dialog.afterClosed().subscribe(result => this.export.emit(result));
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
        <mat-radio-button value="all" style="margin: 4px">Tutti i dati</mat-radio-button>
        <mat-radio-button *ngIf="this.data.selectableRows" value="selected" style="margin: 4px">Righe selezionate</mat-radio-button>
        <mat-radio-button value="current" style="margin: 4px">Pagina Corrente</mat-radio-button>
      </mat-radio-group>

    </mat-dialog-content>
    <div mat-dialog-actions>
      <button mat-button (click)="onNoClick()">Cancel</button>
      <button mat-button [mat-dialog-close]="{ format: format, dataset: dataset }">Export</button>
    </div>
  `,
})
export class IbTableExportDialogComponent {
  format = 'xlsx';
  formats = [
    { value: 'xlsx', viewValue: 'XLSX (Excel)' },
    { value: 'csv', viewValue: 'CSV' },
    { value: 'pdf', viewValue: 'PDF' }
  ];
  dataset = 'all';

  constructor(
    public dialogRef: MatDialogRef<IbTableExportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}
