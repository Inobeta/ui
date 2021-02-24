import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'ib-modal-message',
  template: `
    <h2 mat-dialog-title>{{ data.title | translate }}</h2>
    <mat-dialog-content>{{ data.message | translate }}</mat-dialog-content>
    <mat-dialog-actions>
      <button
        *ngIf="data.hasNo"
        mat-button
        mat-dialog-close>
        {{ 'shared.ui.modalMessage.no' | translate }}
      </button>
      <button
        *ngIf="data.hasYes"
        mat-button
        [mat-dialog-close]="true">
        {{ 'shared.ui.modalMessage.yes' | translate }}
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
