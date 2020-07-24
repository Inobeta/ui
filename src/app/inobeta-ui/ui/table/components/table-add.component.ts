import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'ib-table-add-button',
  template: `
    <div
      class="hover"
      (click)="add.emit()"
      *ngIf="hasAdd"
      fxLayout="row"
      fxLayoutAlign="center center"
      [ngStyle]="{
              'color': 'black',
              'cursor': 'pointer',
              'border': '1px solid black',
              'border-radius': '20px',
              'padding': '5px',
              'padding-left': '10px',
              'padding-right': '15px'
            }">
      <i class="material-icons" style="width: 24px">add_cicle</i> {{ 'shared.ui.table.add' | translate }}
    </div>
  `,
})
export class TableAddComponent {
  @Input() hasAdd;
  @Output() add = new EventEmitter();
}
