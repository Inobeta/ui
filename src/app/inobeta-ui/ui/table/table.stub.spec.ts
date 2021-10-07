import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IbTableAction, IbTableActionsPosition, IbTableTitles } from './models/titles.model';
import { IbTemplateModel } from './models/template.model';
import { IbTableItem } from './models/table-item.model';
import { jsPDFOptions } from 'jspdf';
import { FormControl, FormGroup } from '@angular/forms';

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
  @Input() hasFooter = true;
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
  @Input() actionsPosition = IbTableActionsPosition.BOTH;
  @Input() iconSet = {
    edit: '',
    delete: ''
  };
  @Input() deleteConfirm = true;
  @Input() stickyAreas = [];

  @Output() filterChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() sortChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() add: EventEmitter<any> = new EventEmitter<any>();
  @Output() edit: EventEmitter<any> = new EventEmitter<any>();
  @Output() delete: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowChecked: EventEmitter<any> = new EventEmitter<any>();
  @Input() rowClass = (item: IbTableItem) => ({})

  getSelectedRows() {return [];}
  setFilter() {}
  rowForm() {return new FormGroup({});}
  getFormValues() {return {};}
  isValidForm() {return true;}
  resetFilters() {}
  export() {}
}
