import { Component, ViewContainerRef } from "@angular/core";
import { IbKaiTableAction } from "../kai-table/action";
import { IbDataExportService } from "./data-export.service";

@Component({
  selector: "ib-table-data-export",
  template: `  
    <button
      *ibTableAction
      mat-icon-button
      [matTooltip]="'shared.ibTable.export' | translate"
      (click)="openExportDialog()"
    >
      <mat-icon>file_download</mat-icon>
    </button>
  `,
  providers: [
    { provide: IbKaiTableAction, useExisting: IbTableDataExportAction },
  ],
})
export class IbTableDataExportAction extends IbKaiTableAction {
  constructor(viewContainerRef: ViewContainerRef, private exportService: IbDataExportService) {
    super(null, viewContainerRef);
  }

  openExportDialog() {
    this.exportService.openDialog({});
  }
}
