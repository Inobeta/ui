import {Component, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IbModalMessage } from './modal-message.model';

@Component({
  selector: 'ib-modal-message',
  template: `
    <h2 mat-dialog-title>{{ data.title | translate }}</h2>
    <mat-dialog-content style="min-width:350px;min-height: 10vh;">{{ data.message | translate }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button
        *ngFor="let btn of data.actions"
        mat-button
        [color]="btn.color || 'basic'"
        [mat-dialog-close]="btn.value">
        {{ btn.label | translate }}
      </button>
      <button
        *ngIf="data.hasNo"
        mat-button
        [mat-dialog-close]="false">
        {{ 'shared.ibModal.no' | translate }}
      </button>
      <button
        *ngIf="data.hasYes"
        mat-button
        color="primary"
        [mat-dialog-close]="true">
        {{ 'shared.ibModal.yes' | translate }}
      </button>
    </mat-dialog-actions>`,
})
export class IbModalMessageComponent {

  constructor(
    public dialogRef: MatDialogRef<IbModalMessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IbModalMessage) {}
}
