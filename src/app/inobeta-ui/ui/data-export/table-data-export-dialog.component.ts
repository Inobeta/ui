import { Component, Inject, inject } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

export interface IbTableDataExportDialogData {
  showAllRowsOption: boolean;
  showSelectedRowsOption: boolean;
  formats: { value: string, label: string }[]
}

@Component({
  selector: "ib-table-data-export-dialog",
  template: `
    <h2 mat-dialog-title>
      {{ "shared.ibTable.exportData.title" | translate }}
    </h2>
    <mat-dialog-content [formGroup]="_settings">
      <mat-form-field style="width: 100%;">
        <mat-label>{{
          "shared.ibTable.exportData.format" | translate
        }}</mat-label>
        <mat-select formControlName="format">
          <mat-option *ngFor="let format of data.formats" [value]="format.value">
            {{ format.label }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-radio-group
        formControlName="dataset"
        style="display:flex;flex-direction:column;margin: 10px 0;"
      >
        <mat-radio-button value="all"*ngIf="data?.showAllRowsOption">{{
          "shared.ibTable.exportData.all" | translate
        }}</mat-radio-button>
        <mat-radio-button value="selected" *ngIf="data?.showSelectedRowsOption">
          {{ "shared.ibTable.exportData.selectedRows" | translate }}
        </mat-radio-button>
        <mat-radio-button value="current">{{
          "shared.ibTable.exportData.currentPage" | translate
        }}</mat-radio-button>
      </mat-radio-group>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>
        {{ "shared.ibModal.close" | translate }}
      </button>
      <button mat-button [mat-dialog-close]="settings">
        {{ "shared.ibTable.export" | translate }}
      </button>
    </mat-dialog-actions>
  `,
})
export class IbTableDataExportDialog {
  data: IbTableDataExportDialogData = inject(MAT_DIALOG_DATA);
  _settings = new FormGroup({
    format: new FormControl(this.data.formats[0].value),
    dataset: new FormControl(this.data.showAllRowsOption ? "all" : "current"),
  });

  get settings() {
    return this._settings.value;
  }
}
