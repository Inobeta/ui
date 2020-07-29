import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TableTitles } from '../ui/table/titles.model';
import { TemplateModel } from '../ui/table/template.model';

@Component({
  selector: 'ib-table',
  template: ``,
})
export class TableStubComponent {
  @Input() titles: TableTitles[] = [];
  @Input() items: any[] = [];
  @Input() filterValues: any = {};
  @Input() currentSort: any = {};
  @Input() selectableRows = true;
  @Input() hasAdd = false;
  @Input() hasFilterReset = false;
  @Input() hasSearch = false;
  @Input() hasCsvExport = false;
  @Input() hasPaginator = true;
  @Input() paginatorTemplate;
  @Input() hasActions = false;
  @Input() selectRowName = 'Seleziona';
  @Input() templateButtons: TemplateModel[] = [];
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
