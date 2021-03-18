import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { IbTableAction } from '../models/titles.model';

@Component({
  selector: '[ib-table-actions]',
  template: `
  <ng-container
    *ngTemplateOutlet="((structureTemplates['exportTemplate'] != null) ? structureTemplates['exportTemplate'] : defaultExportTemplate);
    context: { ibTable: context}"
  ></ng-container>
  <ng-template #defaultExportTemplate>
    <ib-table-export
      *ngIf="hasExport"
      [selectableRows]="selectableRows"
      (export)="export.emit($event || {})"
      >
    </ib-table-export>
  </ng-template>
  <ib-table-button
    *ngFor="let a of actions"
    [label]="a.label"
    [color]="a.color || 'basic'"
    (click)="a.handler(context.getSelectedRows())"
  ></ib-table-button>
  <ib-table-button
    *ngIf="hasAdd"
    (click)="add.emit()"
    label="shared.ibTable.add"
  ></ib-table-button>
  `
})

export class IbTableActionsComponent implements OnInit {
  @Input() structureTemplates
  @Input() context;
  @Input() hasExport;
  @Input() hasAdd;
  @Input() selectableRows;
  @Input() actions: IbTableAction[] = [];

  @Output() add: EventEmitter<any> = new EventEmitter<any>();
  @Output() export: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() { }
}
