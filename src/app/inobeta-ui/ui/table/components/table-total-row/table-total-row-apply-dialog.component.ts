import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: 'ib-table-row-apply-dialog',
  template: `
    <h1 mat-dialog-title>{{ 'shared.ibTable.func.dialog.title' | translate }}</h1>
    <mat-dialog-content>
      <mat-form-field appearance="fill" style="width: 100%">
        <mat-label>{{ 'shared.ibTable.func.dialog.selectFunction' | translate }}</mat-label>
        <mat-select [(ngModel)]="function">
          <mat-option *ngFor="let function of functions" [value]="function.value">
            {{function.viewValue | translate}}
          </mat-option>
        </mat-select>
      </mat-form-field>
    </mat-dialog-content>
    <div mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="{ function: function }">{{ 'shared.ibTable.apply' | translate }}</button>
    </div>
  `,
})
export class IbTableTotalRowApplyDialogComponent {
  function = 'sum';
  functions = [
    { value: 'sum', viewValue: 'shared.ibTable.func.sum.name' },
    { value: 'avg', viewValue: 'shared.ibTable.func.avg.name' },
  ];

  constructor(
    public dialogRef: MatDialogRef<IbTableTotalRowApplyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }

}