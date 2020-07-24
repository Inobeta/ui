import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'ib-table-export-csv',
  template: `
    <div class="hover"
         (click)="exportCsv.emit()"
         fxLayout="row"
         *ngIf="hasCsvExport"
         fxLayoutAlign="center center"
         style="cursor:pointer; border: 1px solid gray; border-radius: 20px; padding: 5px;padding-left: 10px;padding-right: 15px;">
      <i class="material-icons">call_made</i> {{ 'shared.ibTable.csv' | translate }}
    </div>
  `,
})
export class TableExportCsvComponent {
  @Input() hasCsvExport;
  @Output() exportCsv = new EventEmitter();
}
