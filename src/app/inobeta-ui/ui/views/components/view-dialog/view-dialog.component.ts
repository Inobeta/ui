import { Component, Inject } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MAT_DIALOG_DATA, MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { TranslateModule } from "@ngx-translate/core";

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

  hideCancel?: boolean;
  hasNo?: boolean;
}

@Component({
  selector: "ib-table-view-dialog",
  template: `
    <h2 mat-dialog-title>{{ data?.title | translate }}</h2>

    <mat-dialog-content>
      @if (data?.hideInput) {
        <p
          translate
          [translateParams]="data?.message?.args"
          >
          {{ data?.message?.label }}
        </p>
      }

      @if (!data?.hideInput) {
        <mat-form-field style="width: 100%;">
          <mat-label>{{ "shared.ibTableView.viewName" | translate }}</mat-label>
          <input [formControl]="viewName" matInput maxlength="40" [required]="data.hideInput ? false : true" />
          <mat-hint align="end">{{ viewName.value?.length ?? 0 }}/40</mat-hint>
        </mat-form-field>
      }
    </mat-dialog-content>

    <div mat-dialog-actions style="justify-content: flex-end">
      @if (!data?.hideCancel) {
        <button mat-button mat-dialog-close>
          {{ "shared.ibTableView.cancel" | translate }}
        </button>
      }
      @if (data?.hasNo) {
        <button mat-button [mat-dialog-close]="{
          confirmed: false
        }">{{ "shared.ibTableView.no" | translate }}</button>
      }
      <button
        mat-button
        [disabled]="!data?.hideInput ? (viewName.value?.length ?? 0) === 0 : false"
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
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule, TranslateModule]
})
export class IbTableViewDialog {
  viewName = new FormControl("");

  constructor(@Inject(MAT_DIALOG_DATA) public data: IbTableViewDialogData) {
    if (data?.viewName) {
      this.viewName.setValue(data?.viewName.substring(0, 40));
    }
  }
}
