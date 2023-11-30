import {Component, EventEmitter, Input, Output, Inject} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';


/**
* @deprecated Use IbKaiTableModule
*/
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
    <h2 mat-dialog-title>{{ 'shared.ibTable.exportData.title' | translate }}</h2>
    <mat-dialog-content>
      <div>
        <mat-form-field>
          <mat-label>{{ 'shared.ibTable.exportData.format' | translate }}</mat-label>
          <mat-select [(ngModel)]="format">
            <mat-option *ngFor="let format of formats" [value]="format.value">
              {{format.viewValue}}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <mat-radio-group [(ngModel)]="dataset" style="display:flex;flex-direction:column;margin: 15px 0;">
        <mat-radio-button value="all" style="margin: 4px">{{ 'shared.ibTable.exportData.all' | translate }}</mat-radio-button>
        <mat-radio-button *ngIf="this.data.selectableRows" value="selected" style="margin: 4px">
          {{ 'shared.ibTable.exportData.selectedRows' | translate }}
        </mat-radio-button>
        <mat-radio-button value="current" style="margin: 4px">{{ 'shared.ibTable.exportData.currentPage' | translate }}</mat-radio-button>
      </mat-radio-group>

    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()">{{ 'shared.ibModal.close' | translate }}</button>
      <button mat-button color="primary" [mat-dialog-close]="{ format: format, dataset: dataset }">
        {{ 'shared.ibTable.export' | translate }}
      </button>
    </mat-dialog-actions>
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
