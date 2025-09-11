import {Component, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IbModalMessage } from './modal-message.model';

@Component({
    selector: 'ib-modal-message',
    template: `
    <h2 mat-dialog-title>{{ data.title | translate }}</h2>
    <mat-dialog-content
      [ngStyle]="{
        'min-width': this.data.minWidth ?? '350px',
        'min-height': this.data.minHeight ?? '10vh'
      }"
    >{{ data.message | translate }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      @for (btn of data.actions; track btn) {
        <button
          mat-button
          [color]="btn.color || 'basic'"
          [mat-dialog-close]="btn.value">
          {{ btn.label | translate }}
        </button>
      }
      @if (data.hasNo) {
        <button
          mat-button
          [mat-dialog-close]="false">
          {{ 'shared.ibModal.no' | translate }}
        </button>
      }
      @if (data.hasYes) {
        <button
          mat-button
          color="primary"
          [mat-dialog-close]="true">
          {{ 'shared.ibModal.yes' | translate }}
        </button>
      }
    </mat-dialog-actions>`,
    standalone: false
})
export class IbModalMessageComponent {

  constructor(
    public dialogRef: MatDialogRef<IbModalMessageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IbModalMessage) {}
}
