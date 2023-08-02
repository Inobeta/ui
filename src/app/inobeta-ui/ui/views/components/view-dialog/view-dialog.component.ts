import { Component, Inject } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

export interface IbTableViewDialogData {
  title: string;
  message?: {
    label: string;
    args?: any;
  };
  confirm: string;
  color?: string;

  viewName?: string;
  hideInput?: boolean;
}

@Component({
  selector: "ib-table-view-dialog",
  template: `
    <h2 mat-dialog-title>{{ data?.title | translate }}</h2>

    <mat-dialog-content>
      <p
        *ngIf="data?.hideInput"
        translate
        [translateParams]="data?.message?.args"
      >
        {{ data?.message?.label }}
      </p>

      <mat-form-field style="width: 100%;" *ngIf="!data?.hideInput">
        <mat-label>{{ "shared.ibTableView.viewName" | translate }}</mat-label>
        <input [formControl]="viewName" matInput maxlength="40" />
        <mat-hint align="end">{{ viewName.value.length }}/40</mat-hint>
      </mat-form-field>
    </mat-dialog-content>

    <div mat-dialog-actions style="justify-content: flex-end">
      <button mat-button mat-dialog-close>
        {{ "shared.ibTableView.cancel" | translate }}
      </button>
      <button
        mat-button
        [disabled]="!data?.hideInput ? viewName.value.length === 0 : false"
        [color]="data?.color ?? 'primary'"
        [mat-dialog-close]="{
          name: viewName.value,
          confirmed: true
        }"
      >
        {{ data?.confirm | translate }}
      </button>
    </div>
  `,
})
export class IbTableViewDialog {
  viewName = new FormControl("");

  constructor(@Inject(MAT_DIALOG_DATA) public data: IbTableViewDialogData) {
    if (data?.viewName) {
      this.viewName.setValue(data?.viewName.substring(0, 40));
    }
  }
}
