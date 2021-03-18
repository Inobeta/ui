import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IbTableTitles } from './models/titles.model';
import { IbTemplateModel } from './models/template.model';

@Component({
  selector: 'ib-table',
  template: ``,
})
export class IbTableStubComponent {
  @Input() titles: IbTableTitles[] = [];
  @Input() items: any[] = [];
  @Input() filterValues: any = {};
  @Input() currentSort: any = {};
  @Input() selectableRows = true;
  @Input() hasAdd = false;
  @Input() hasFilterReset = false;
  @Input() hasSearch = false;
  @Input() hasExport = false;
  @Input() hasPaginator = true;
  @Input() structureTemplates;
  @Input() hasActions = false;
  @Input() templateButtons: IbTemplateModel[] = [];
  @Input() templateHeaders: any = {};
  @Input() actions: string[] = [];
  @Output() filterChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() filterReset: EventEmitter<any> = new EventEmitter<any>();
  @Output() sortChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() add: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteItem: EventEmitter<any> = new EventEmitter<any>();
  @Output() arrowClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() actionsClick: EventEmitter<any> = new EventEmitter<any>();
}
