import { Component, Inject } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { IbTableItem } from "public_api";

export class TotalRow {
  columns = {};

  apply(functionName: string, data: IbTableItem[], key: string) {
    if (functionName === 'sum') {
      return data.reduce((acc, cur) => acc + cur[key], 0);
    }

    if (functionName === 'avg') {
      return data.reduce((acc, cur) => acc + cur[key], 0) / data.length;
    }
  }

  shouldShowTotal(key: string) {
    return key in this.columns;
  }

  toggle(key: string, functionName: string) {
    this.columns[key] = functionName;
    console.log(this.columns);
  }
}

@Component({
  selector: 'ib-table-row-apply-dialog',
  template: `
    <h1 mat-dialog-title>{{ 'shared.ibTable.func.dialog.title' | translate }}</h1>
    <mat-dialog-content>
      <div>
        <mat-form-field>
          <mat-label>{{ 'shared.ibTable.func.dialog.selectFunction' | translate }}</mat-label>
          <mat-select [(ngModel)]="function">
            <mat-option *ngFor="let function of functions" [value]="function.value">
              {{function.viewValue | translate}}
            </mat-option>
          </mat-select>
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <div mat-dialog-actions>
      <button mat-button [mat-dialog-close]="{ function: function }">{{ 'shared.ibTable.apply' | translate }}</button>
    </div>
  `,
})
export class IbTableRowApplyDialogComponent {
  function = 'sum';
  functions = [
    { value: 'sum', viewValue: 'shared.ibTable.func.sum.name' },
    { value: 'avg', viewValue: 'shared.ibTable.func.avg.name' },
  ];

  constructor(
    public dialogRef: MatDialogRef<IbTableRowApplyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}