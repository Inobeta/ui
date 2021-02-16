import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Sort } from '@angular/material';
import { TableCellAligns, TableTitles, TableTitlesTypes } from './models/titles.model';
import { TemplateModel } from './models/template.model';
import { Store } from '@ngrx/store';
import * as TableFiltersActions from './redux/table.action';
import Papa from 'papaparse';
import jsPDF, { jsPDFOptions } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'ib-table',
  template: `
    <div fxLayout="column" class="ib-table">
      <div fxLayout="row" fxLayoutAlign="left center" fxLayoutGap="20px">
        <div fxFlex fxLayout="row" fxLayoutAlign="start center" fxLayoutGap="20px">

          <ng-container
            *ngTemplateOutlet="((structureTemplates['exportTemplate'] != null) ? structureTemplates['exportTemplate'] : defaultExportTemplate);
            context: { ibTable: this}"
          ></ng-container>
          <ng-template #defaultExportTemplate>
            <ib-table-export
              *ngIf="hasExport"
              (export)="export($event || {})"
              >
            </ib-table-export>
          </ng-template>
          <ib-table-menu-actions
            [menuTableActions]="menuTableActions"
            [actionsLength]="actions.length"
            [hasActions]="hasActions">
          </ib-table-menu-actions>
          <ib-table-add-button
            [hasAdd]="hasAdd"
            (add)="add.emit()">
          </ib-table-add-button>
          <!--<ib-table-filter-reset-button
            (filterReset)="filterReset.emit()"
            [hasFilterReset]="hasFilterReset">
          </ib-table-filter-reset-button>-->
        </div>
      </div>
      <div>
        <table
          matSort
          (matSortChange)="sortData($event)"
          [matSortActive]="currentSort ? currentSort.active : null"
          [matSortDirection]="currentSort ? currentSort.direction : null"
          style="width:100%;" cellpadding="0" cellspacing="0">

          <!--HEADER-->
          <thead>
            <tr class="table-header" ib-table-header
              [table]="this"
              [titles]="titles"
              [selectRowName]="selectRowName"
              [selectableRows]="selectableRows"
              [templateHeaders]="templateHeaders"
              [templateButtons]="templateButtons"
              [columnFilter]="columnFilter"
              [currentSort]="currentSort"
              (handleSetFilter)="setFilter($event.key, $event.value, $event.indexToSet)"
            ></tr>
          </thead>

          <!--ROWS-->
          <tbody ib-table-rows
            [titles]="titles"
            [sortedData]="sortedData"
            [customItemTemplate]="customItemTemplate"
            [selectableRows]="selectableRows"
            [templateButtons]="templateButtons"
            (rowClicked)="rowClicked.emit($event)"
            (rowChecked)="rowChecked.emit($event)"
          ></tbody>

          <tr *ngIf="sortedData.length === 0">
            <td [attr.colspan]="4+titles.length" style="text-align: center;">
              <br><br>{{ 'shared.ibTable.noData' | translate }}<br><br>
            </td>
          </tr>
        </table>
      </div>
      <ng-container
        *ngTemplateOutlet="((structureTemplates['paginatorTemplate'] != null) ? structureTemplates['paginatorTemplate'] : defaultPaginatorTemplate);
        context: this"
      ></ng-container>
      <ng-template #defaultPaginatorTemplate>
        <ib-table-paginator
          *ngIf="hasPaginator"
          [numOfElements]="numOfElements"
          [paginationInfo]="currentPagination"
          (pageChangeHandle)="pageChangeHandle($event)"
          [elemForPage]="currentPagination.pageSize">
        </ib-table-paginator>
      </ng-template>
    </div>
    <mat-menu #menuTableActions="matMenu">
      <button mat-menu-item *ngFor="let a of actions" (click)="actionButtonClick(a)">{{ a }}</button>
    </mat-menu>
  `,
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnChanges {

  // input necessari
  @Input() customItemTemplate: any;
  @Input() titles: TableTitles[] = [];
  @Input() items: any[] = [];
  @Input() enableReduxStore = false;
  @Input() currentSort: any = {}; // this input can override redux store. Can we remove it?
  @Input() selectableRows = true;
  @Input() hasAdd = false;
  // @Input() hasFilterReset = false; this feature is not working but it can be useful
  @Input() hasSearch = false;
  @Input() hasExport = false;
  @Input() hasPaginator = true;

  @Input() structureTemplates = {}; //exportTemplate, paginatorTemplate
  @Input() hasActions = false;
  @Input() selectRowName = 'Seleziona';
  @Input() templateButtons: TemplateModel[] = [];
  @Input() templateHeaders: any = {};
  /** { columnName: TemplateRef } */
  @Input() tableName = 'default_table_name'; // change this value in order to partition redux data
  @Input() pdfCustomStyles = {};
  @Input() pdfSetup: jsPDFOptions = {
    orientation: 'l',
    unit: null,
    format: null
  };

  // input non necessari
  @Input() actions: string[] = [];

  // Output necessari
  @Output() filterChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() sortChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() add: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteItem: EventEmitter<any> = new EventEmitter<any>();

  @Output() arrowClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() actionsClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowChecked: EventEmitter<any> = new EventEmitter<any>();

  /*objectKeys = Object.keys;*/
  filterableTitles: TableTitles[] = [];
  typeEnum = TableTitlesTypes;
  alignEnum = TableCellAligns;
  sortedData;
  currentPagination: any = {};
  columnFilter = {};
  numOfElements = 0;

  constructor(private store: Store<any>, private translate: TranslateService) { }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('changes', changes);
    if (changes.enableReduxStore && changes.enableReduxStore.currentValue) {
      this.store.select(rootState => rootState.tableFiltersState.tableFilters).subscribe(tableFilters => {
        const data = tableFilters[this.tableName];
        console.log('data', data);

        if (data) {
          if (data.paginatorFilters) {
            this.currentPagination = data.paginatorFilters;
          } else {
            this.currentPagination = {
              pageIndex: 0,
              pageSize: 10,
              previousPageIndex: 0
            };
          }

          for (const prop of Object.keys(data).filter(p => ['paginatorFilters', 'sortType'].indexOf(p) === -1)) {
            this.setFilter(prop, data[prop].value, this.currentPagination.pageIndex);
          }
          if (data.sortType) {
            this.sortData(data.sortType, false);
          }
        }

      });
    }

    let triggerRefresh = false;
    if (changes.items && changes.items.currentValue) {
      this.items = changes.items.currentValue;
      this.sortedData = this.items.slice();
      triggerRefresh = true;
    }

    if (changes.titles && changes.titles.currentValue) {
      this.filterableTitles = changes.titles.currentValue.filter(el => el.filterable);
    }

    if (changes.currentSort && changes.currentSort.currentValue) {
      this.currentSort = changes.currentSort.currentValue;
      triggerRefresh = true;
    }

    if (triggerRefresh) {
      this.pageChangeHandle({
        previousPageIndex: this.currentPagination.previousPageIndex ? this.currentPagination.previousPageIndex : 0,
        pageIndex: this.currentPagination.pageIndex ? this.currentPagination.pageIndex : 0,
        pageSize: this.currentPagination.pageSize ? this.currentPagination.pageSize : 10,
        length: this.sortedData.length
      });
    }
  }

  sortData(sort: Sort, emitChange: boolean = true) {
    if (Object.keys(sort).length !== 0) {
      this.store.dispatch(TableFiltersActions.addSortToTable({
        tableName: this.tableName,
        sortType: sort,
        emitChange
      }));
    }
    if (emitChange) {
      this.sortChange.emit(sort);
    }
    this.currentSort = sort;

    this.sortedData = this.items.slice();

    for (const k in this.columnFilter) {
      if (!this.columnFilter[k]) {
        delete this.columnFilter[k];
      }
    }
    if (Object.keys(this.columnFilter).length > 0) {

      this.sortedData = this.sortedData.filter(el => {
        let include = true;
        // tslint:disable-next-line: forin
        for (const k in this.columnFilter) {
          /*TODO INSERT COLUMN TYPE HERE */
          switch (this.titles.find(t => t.key === k).type) {
            case TableTitlesTypes.STRING:
              if (!(el[k] && el[k].includes && el[k].toLowerCase().includes(this.columnFilter[k].toLowerCase()))) {
                include = false;
              }
              break;
            case TableTitlesTypes.NUMBER:
              if (!(el[k] && el[k].toString() && el[k].toString().includes(this.columnFilter[k].toString().toLowerCase()))) {
                include = false;
              }
              break;
            default:
              include = true;
          }

        }
        return include;
      });

    }
    this.numOfElements = this.sortedData.length;

    if (!sort || !sort.active || sort.direction === '') {
      this.currentSort = {};
      this.paginationHandle();
      return;
    }

    this.sortedData = this.sortedData.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      return compare(a[sort.active], b[sort.active], isAsc);
    });

    this.paginationHandle();
  }

  setFilter(key, value, indexToSet = 0) {
    this.columnFilter[key] = value;
    this.currentPagination.pageIndex = indexToSet;
    this.pageChangeHandle(this.currentPagination);
    this.store.dispatch(TableFiltersActions.addFilterToTable({
      tableName: this.tableName,
      filterName: key,
      filterValue: value
    }));
  }

  resetFilters() {
    this.columnFilter = {};
  }

  pageChangeHandle(data) {
    this.store.dispatch(TableFiltersActions.addPaginatorFiltersToTable({
      tableName: this.tableName,
      previousPageIndex: data.previousPageIndex,
      pageIndex: data.pageIndex,
      pageSize: data.pageSize,
      lengthP: data['length']
    }));
    this.currentPagination = data;
    this.sortData(this.currentSort, false);
  }

  paginationHandle() {
    /*
    * all'interno di data ho questo:
    * {
    *   length: 15
        pageIndex: 0
        pageSize: 5 (elementi per pagina)
        previousPageIndex: 0
      }
    */
    const data = this.currentPagination;
    const paginatedData = [];
    // scorro tutte le pagine della tabella
    for (let i = data.pageIndex * data.pageSize; i < (data.pageIndex + 1) * data.pageSize; i++) {
      if (i >= this.sortedData.length) {
        break;
      }
      paginatedData.push(this.sortedData[i]);
    }
    this.sortedData = paginatedData;
  }

  async export({ format, dataset }) {
    const previousPagination = this.currentPagination;
    if (dataset === 'all') {
      const pagination = {
        tableName: this.tableName,
        previousPageIndex: 0,
        pageIndex: 0,
        pageSize: this.items.length,
        lengthP: this.items.length
      };
      this.store.dispatch(TableFiltersActions.addPaginatorFiltersToTable(pagination));
      this.currentPagination = pagination;
      this.sortData(this.currentSort, false);
    }

    const keys = this.titles.map(h => h.key);
    const getValueFromKey = (row, key) => {
      const value = row[key];
      const h = this.titles.find(t => t.key === key);
      if (h.type === TableTitlesTypes.MATERIAL_SELECT) {
        return h.materialSelectItems.find(item => item.value === value).label;
      }
      return value;
    };
    const filteredData = this.sortedData
      .map(
        row => Object.keys(row)
          .filter(key => keys.includes(key))
          .reduce((o, key) => ({
            ...o,
            [key]: getValueFromKey(row, key)
          }), {})
    );

    const translatedHeaders = await Promise.all(this.titles.map(async t => ({
      value: await this.translate.get(t.value).toPromise(),
      key: t.key,
    })));

    if (format === 'csv') {
      this.csvExport(filteredData, translatedHeaders);
    }

    if (format === 'pdf') {
      this.pdfExport(filteredData, translatedHeaders);
    }

    if (format === 'xlsx') {
      this.xlsxExport(filteredData, translatedHeaders);
    }

    if (dataset === 'all') {
      this.currentPagination = previousPagination;
      this.sortData(this.currentSort, false);
    }
  }

  pdfExport(body, titles) {
    const columns = titles.map(t => ({ header: t.value, dataKey: t.key }));
    const doc = new jsPDF(this.pdfSetup.orientation, this.pdfSetup.unit, this.pdfSetup.format);
    autoTable(doc, {
      ...this.pdfCustomStyles,
      body,
      columns,
    });
    doc.save(this.tableName + '.pdf');
  }

  xlsxExport(filteredData, titles) {
    const header = titles.reduce((o, t) => ({ ...o, [t.key]: t.value }), {});
    const data = [header, ...filteredData];
    const ws = XLSX.utils.json_to_sheet(data, { skipHeader: true });
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, this.tableName);
    XLSX.writeFile(wb, this.tableName + '.xlsx');
  }

  csvExport(filteredData, titles) {
    const nameFromKey = (key) =>
      titles.find(t => t.key === key).value;
    const data = filteredData.map(row => Object.keys(row).reduce((o, key) => ({ ...o, [nameFromKey(key)]: row[key] }), {}));
    const csv = Papa.unparse(data, {
      quotes: true,
      delimiter: ';',
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, this.tableName + '.csv');
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', this.tableName + '.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }

  actionButtonClick(a) {
    this.actionsClick.emit({
      action: a,
      data: this.sortedData.filter((el) => el.checked)
    });
  }

  emitItemAndCheckbox(item, checkbox) {
    this.rowChecked.emit({ item, isChecked: checkbox });
  }
}

function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
