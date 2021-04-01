import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IbTableAction, IbTableTitles } from './models/titles.model';
import { IbTemplateModel } from './models/template.model';
import { IbTableItem } from './models/table-item.model';
import { jsPDFOptions } from 'jspdf';

@Component({
  selector: 'ib-table',
  template: ``,
})
export class IbTableStubComponent {
  @Input() customItemTemplate: any;
  @Input() titles: IbTableTitles[] = [];
  @Input() items: IbTableItem[] = [];
  @Input() enableReduxStore = false;
  @Input() currentSort: any = {};
  @Input() selectableRows = true;
  @Input() hasAdd = false;
  @Input() hasEdit = false;
  @Input() hasDelete = false;
  @Input() hasExport = false;
  @Input() hasPaginator = true;
  @Input() actions: IbTableAction[] = [];
  @Input() structureTemplates = {};
  @Input() templateButtons: IbTemplateModel[] = [];
  @Input() templateHeaders: any = {};
  @Input() tableName = 'default_table_name';
  @Input() pdfCustomStyles = {};
  @Input() pdfSetup: jsPDFOptions = {
    orientation: 'l',
    unit: null,
    format: null
  };
  @Output() filterChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() sortChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() add: EventEmitter<any> = new EventEmitter<any>();
  @Output() edit: EventEmitter<any> = new EventEmitter<any>();
  @Output() delete: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowChecked: EventEmitter<any> = new EventEmitter<any>();
}
