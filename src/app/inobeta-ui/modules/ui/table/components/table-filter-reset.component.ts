import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'ib-table-filter-reset-button',
  template: `
    <div
      *ngIf="hasFilterReset"
      class="hover"
      (click)="filterReset.emit()"
      fxLayout="row"
      fxLayoutAlign="center center"
      [ngStyle]="{
              'color':'white',
              'background-color':'#f2536e',
              'cursor':'pointer',
              'border': '0px',
              'border-radius': '20px',
              'padding': '5px',
              'padding-left': '10px',
              'padding-right': '15px'
            }">
      <i class="material-icons">restore</i> {{ 'shared.ibTable.filterReset' | translate }}
    </div>
  `,
})
export class IbTableFilterResetComponent {
  @Input() hasFilterReset;
  @Output() filterReset = new EventEmitter();
}
