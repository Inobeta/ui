import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'ib-modal-message',
  template: `
    <h2 mat-dialog-title>{{ data.title | translate }}</h2>
    <mat-dialog-content style="min-width:250px;">{{ data.message | translate }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button
        *ngIf="data.hasNo"
        mat-raised-button
        color="warn"
        mat-dialog-close>
        {{ 'shared.ibModal.no' | translate }}
      </button>
      <button
        *ngIf="data.hasYes"
        mat-raised-button
        color="primary"
        [mat-dialog-close]="true">
        {{ 'shared.ibModal.yes' | translate }}
      </button>
    </mat-dialog-actions>`,
})
export class IbModalMessageComponent {

  constructor(
    public dialogRef: MatDialogRef<IbModalMessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  dismiss() {
    this.dialogRef.close();
  }
}
