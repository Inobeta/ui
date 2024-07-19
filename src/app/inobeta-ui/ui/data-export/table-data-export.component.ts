import { Component, EventEmitter, Input, Output } from "@angular/core";
import { filter } from "rxjs/operators";
import {
  IDataExportSettings,
  IbDataExportService,
} from "./data-export.service";

@Component({
  selector: "ib-table-data-export-action",
  template: `
    <button
      mat-icon-button
      [matTooltip]="'shared.ibTable.export' | translate"
      (click)="openExportDialog()"
    >
      <mat-icon>file_download</mat-icon>
    </button>
  `,
})
export class IbTableDataExportAction {
  @Input() showAllRowsOption = false;
  @Input() showSelectedRowsOption = false;
  @Output() ibDataExport = new EventEmitter<IDataExportSettings>();

  constructor(public exportService: IbDataExportService) {}

  openExportDialog() {
    this.exportService
      .openExportDialog({
        showSelectedRowsOption: this.showSelectedRowsOption,
        showAllRowsOption: this.showAllRowsOption,
      })
      .pipe(filter((settings) => !!settings))
      .subscribe((settings) => this.ibDataExport.emit(settings));
  }
}
