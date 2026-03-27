import { Component, EventEmitter, inject, Input, Output } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { TranslatePipe } from "@ngx-translate/core";
import { filter } from "rxjs/operators";
import {
  IbDataExportService,
  IDataExportSettings,
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
  standalone: true,
  imports: [
    MatButtonModule, MatIcon, MatTooltipModule, TranslatePipe
  ],
})
export class IbTableDataExportAction {
  @Input() showAllRowsOption = false;
  @Input() showSelectedRowsOption = false;
  @Output() ibDataExport = new EventEmitter<IDataExportSettings>();
  exportService: IbDataExportService = inject(IbDataExportService);
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
