import { Component } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

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
          <mat-option *ngFor="let format of formats" [value]="format.value">
            {{ format.viewValue }}
          </mat-option>
        </mat-select>
      </mat-form-field>

      <mat-radio-group
        formControlName="dataset"
        style="display:flex;flex-direction:column;margin: 10px 0;"
      >
        <mat-radio-button value="all">{{
          "shared.ibTable.exportData.all" | translate
        }}</mat-radio-button>
        <mat-radio-button value="selected">
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
      <button mat-button color="primary" [mat-dialog-close]="settings">
        {{ "shared.ibTable.export" | translate }}
      </button>
    </mat-dialog-actions>
  `,
})
export class IbTableDataExportDialog {
  formats = [
    { value: "xlsx", viewValue: "XLSX (Excel)" },
    { value: "csv", viewValue: "CSV" },
    { value: "pdf", viewValue: "PDF" },
  ];

  _settings = new FormGroup({
    format: new FormControl("xlsx"),
    dataset: new FormControl("all"),
  });

  get settings() {
    return this._settings.value;
  }
}
