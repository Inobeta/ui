import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { Sort } from '@angular/material/sort';
import { IbStickyAreas, IbTableAction, IbTableActionsPosition, IbTableCellAligns, IbTableTitles, IbTableTitlesTypes } from './models/titles.model';
import { IbTemplateModel } from './models/template.model';
import { Store } from '@ngrx/store';
import Papa from 'papaparse';
import jsPDF, { jsPDFOptions } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { TranslateService } from '@ngx-translate/core';
import { IbTableItem } from './models/table-item.model';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { formatDate } from '@angular/common';
import { ibTableSelectFilters, ibTableSelectPaginator, ibTableSelectSort, ibTableSelectTotalRow } from './store/selectors/table.selectors';
import { ibTableActionAddFilterField, ibTableActionLoadConfig, ibTableActionSaveConfig, ibTableActionSelectSortingField, ibTableActionSetPaginator } from './store/actions/table.actions';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'ib-table',
  template: `
    <div fxLayout="column" class="ib-table" >
      <div
        fxFlex
        ib-table-actions
        fxLayout="row"
        fxLayoutAlign="end center"
        fxLayoutGap="20px"
        [structureTemplates]="structureTemplates"
        [context]="this"
        [hasAdd]="hasAdd"
        [hasExport]="hasExport"
        [selectableRows]="selectableRows"
        [ngStyle]="{
          'padding-bottom': (actions.length > 0 || hasAdd || hasExport) ? '5px' : '0px'
        }"
        [actions]="actions"
        *ngIf="[ibTableActionsPosition.BOTH, ibTableActionsPosition.TOP].indexOf(actionsPosition) > -1"
        (add)="add.emit()"
        (export)="export($event)"
      >
      </div>
      <div class="ib-table-container"
        [ngStyle]="{
          'overflow-x': (stickyAreas.length > 0) ? 'unset' : 'auto'
        }"
      >
        <table
          matSort
          (matSortChange)="sortData($event)"
          [matSortActive]="currentSort ? currentSort.active : null"
          [matSortDirection]="currentSort ? currentSort.direction : null"
          style="width:100%;" cellpadding="0" cellspacing="0">

          <!--HEADER-->
          <thead [class.ib-header-sticky]="stickyAreas.includes(ibStickyArea.HEADER)">
            <tr class="table-header"
              ib-table-header
              [table]="this"
              [titles]="titles"
              [selectableRows]="selectableRows"
              [templateHeaders]="templateHeaders"
              [templateButtons]="templateButtons"
              [columnFilter]="columnFilter"
              [hasEdit]="hasEdit"
              [hasDelete]="hasDelete"
              [hasConfig]="hasConfig"
              [currentSort]="currentSort"
              (handleSetFilter)="setFilter($event.key, $event.value, $event.indexToSet)"
              [stickyAreas]="stickyAreas"
              [tableName]="tableName"
            ></tr>
          </thead>

          <!--ROWS-->
          <tbody
          >
            <tr
              ib-table-row
              class="table-row"
              [ngClass]="rowClass(item)"
              [iconSet]="rowIconSet"
              *ngFor="let item of sortedData"
              [item]="item"
              [titles]="titles"
              [customItemTemplate]="customItemTemplate"
              [selectableRows]="selectableRows"
              [templateButtons]="templateButtons"
              [formRow]="rowForm(item)"
              [hasEdit]="hasEdit"
              [hasDelete]="hasDelete"
              [deleteConfirm]="deleteConfirm"
              [stickyAreas]="stickyAreas"
              (rowChecked)="rowChecked.emit($event)"
              (click)="rowClicked.emit(item)"
              (edit)="edit.emit($event)"
              (delete)="delete.emit($event)"
            >
            </tr>

          <tr *ngIf="sortedData.length === 0">
            <td
              [attr.colspan]="titles.length + templateButtons.length + (selectableRows ? 1 : 0) + (hasEdit ? 1 : 0) + (hasDelete ? 1 : 0) + 1"
              style="text-align: center;"
            >
              <br><br>{{ 'shared.ibTable.noData' | translate }}<br><br>
            </td>
          </tr>

          <tr
            ib-table-total-row
            *ngIf="hasFooter"
            class="table-row"
            [class.ib-footer-sticky]="stickyAreas.includes(ibStickyArea.FOOTER)"
            [titles]="titles"
            [selectableRows]="selectableRows"
            [templateButtons]="templateButtons"
            [hasEdit]="hasEdit"
            [sortedData]="sortedData"
            [filteredData]="filteredData"
            [hasDelete]="hasDelete"
            [totalRowDef]="totalRow$ | async"
            [tableName]="tableName"
            ></tr>
          </tbody>
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
      <div
        fxFlex
        ib-table-actions
        fxLayout="row"
        fxLayoutAlign="end center"
        fxLayoutGap="20px"
        [structureTemplates]="structureTemplates"
        [context]="this"
        [hasAdd]="hasAdd"
        [hasExport]="hasExport"
        [selectableRows]="selectableRows"
        [actions]="actions"
        *ngIf="[ibTableActionsPosition.BOTH, ibTableActionsPosition.BOTTOM].indexOf(actionsPosition) > -1"
        (add)="add.emit()"
        (export)="export($event)"
      >
      </div>
    </div>
  `,
  styleUrls: ['./table.component.css']
})
export class IbTableComponent implements OnChanges, OnInit, OnDestroy {

  // input necessari
  @Input() customItemTemplate: any;
  @Input() titles: IbTableTitles[] = [];
  @Input() items: IbTableItem[] = [];
  @Input() enableReduxStore = false;
  @Input() currentSort: any = {}; // this input can override redux store. Can we remove it?
  @Input() selectableRows = true;
  @Input() hasAdd = false;
  @Input() hasEdit = false;
  @Input() hasDelete = false;
  @Input() hasExport = false;
  @Input() hasPaginator = true;
  @Input() hasFooter = true;
  @Input() hasConfig = true;
  @Input() actions: IbTableAction[] = [];
  @Input() stickyAreas = [];

  @Input() structureTemplates = {}; // exportTemplate, paginatorTemplate
  @Input() templateButtons: IbTemplateModel[] = [];
  @Input() templateHeaders: any = {};
  /** { columnName: TemplateRef } */
  @Input() tableName = '';
  @Input() pdfCustomStyles = {};
  @Input() pdfSetup: jsPDFOptions = {
    orientation: 'l',
    unit: null,
    format: null
  };
  @Input() deleteConfirm = true;
  @Input() actionsPosition = IbTableActionsPosition.BOTH;
  defaultIconSet = {
    edit: 'edit',
    delete: 'delete'
  };
  @Input() iconSet = this.defaultIconSet;
  rowIconSet = Object.assign({}, this.defaultIconSet);
  // Output necessari
  @Output() filterChange: EventEmitter<any> = new EventEmitter<any>();
  /** deprecated
   * Obsolete, use effects interception instead
   */
  @Output() sortChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() add: EventEmitter<any> = new EventEmitter<any>();
  @Output() edit: EventEmitter<any> = new EventEmitter<any>();
  @Output() delete: EventEmitter<any> = new EventEmitter<any>();

  @Output() rowClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowChecked: EventEmitter<any> = new EventEmitter<any>();

  /*objectKeys = Object.keys;*/
  filterableTitles: IbTableTitles[] = [];
  typeEnum = IbTableTitlesTypes;
  alignEnum = IbTableCellAligns;
  sortedData: IbTableItem[];
  filteredData: IbTableItem[];
  currentPagination: any = {};
  columnFilter = {};
  numOfElements = 0;
  rowForms: FormGroup[] = [];
  ibTableActionsPosition = IbTableActionsPosition;
  ibStickyArea = IbStickyAreas;
  totalRow$ = new Observable();
  private _paginatorSub: Subscription;
  private _filterSub: Subscription;
  private _sortSub: Subscription;
  @Input() rowClass = (item: IbTableItem) => ({});


  constructor(
    private store: Store<any>,
    private translate: TranslateService,
    private fb: FormBuilder,
    private router: Router
    ) { }

  ngOnInit() {
    if(!this.tableName){
      const fullUrl = this.router['location']._platformLocation?.location.pathname;
      console.warn(`[ibTable] please set a unique tableName input value or ${fullUrl} will be used as unique key for config storage`);
      this.tableName = fullUrl;
    }
    this.store.dispatch(ibTableActionLoadConfig({ configName: null, tableName: this.tableName }));

    this.totalRow$ = this.store.select(ibTableSelectTotalRow(this.tableName));

    this._paginatorSub = this.store.select(ibTableSelectPaginator(this.tableName)).subscribe(paginator => {
      this.currentPagination = {
        pageIndex: paginator?.pageIndex || 0,
        pageSize: paginator?.pageSize || 10,
        length: paginator?.length,
      };
    });

    this._sortSub = this.store.select(ibTableSelectSort(this.tableName))
      .subscribe(sort => {
        this.currentSort = {
          active: sort?.columnName,
          direction: sort?.direction,
        };
        this._sortData(this.currentSort);
    });

    this._filterSub = this.store.select(ibTableSelectFilters(this.tableName)).subscribe(data => {
      if (!data) {
        return;
      }
      this.resetFilters();
      data.forEach(f => this.setFilter(f.columnName, f.value, this.currentPagination.pageIndex || 0, false, this.tableName));
      this.pageChangeHandle(this.currentPagination);
    });
  }

  ngOnDestroy() {
    this._paginatorSub.unsubscribe();
    this._filterSub.unsubscribe();
    this._sortSub.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.iconSet && changes.iconSet.currentValue){
      this.rowIconSet = Object.assign({}, this.defaultIconSet, changes.iconSet.currentValue);
    }

    let triggerRefresh = false;
    if (changes.items && changes.items.currentValue) {
      this.items = changes.items.currentValue;
      this.sortedData = this.items.slice();
      triggerRefresh = true;
      this.rowForms = [];
      for (const i of this.items) {
        const rowGroup = {
          isChecked: new FormControl(i.ibTableItemSelected),
        };
        for (const k of this.titles.map(h => h.key)) {
          rowGroup[k] = new FormControl(i[k]);
        }
        this.rowForms.push(this.fb.group(rowGroup));
      }
    }

    if (changes.titles && changes.titles.currentValue) {
      this.filterableTitles = changes.titles.currentValue.filter(el => el.filterable);
    }

    if (changes.currentSort && changes.currentSort.currentValue) {
      this.currentSort = changes.currentSort.currentValue;
      triggerRefresh = true;
    }

    if (triggerRefresh) {
      this.pageChangeHandle(this.currentPagination);
    }
  }

  rowForm(item) {
    return this.rowForms[this.items.indexOf(item)];
  }

  getFormValues(dataset = 'all') {
    let filteredData = this.sortedData;

    if (dataset === 'selected') {
      filteredData = this.getSelectedRows();
    }

    const rowData = [];
    for (const i of filteredData) {
      rowData.push(this.rowForm(i).value);
    }
    return rowData;
  }

  isValidForm() {
    for (const r of this.rowForms) {
      if (!r.valid) { return false; }
    }
    return true;
  }

  sortData(sort: Sort, emitChange: boolean = true) {
    this.store.dispatch(ibTableActionSelectSortingField({
      tableName: this.tableName,
      options: {
        direction: sort.direction,
        columnName: sort.active
      }
    }));
  }

  _sortData(sort: Sort, emitChange: boolean = true) {
    if (emitChange) {
      this.sortChange.emit(sort);
    }
    this.currentSort = sort;

    this.sortedData = this.items.slice();

    for (const k in this.columnFilter) {
      if (!this.columnFilter[k] && this.columnFilter[k] !== false) {
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
            case IbTableTitlesTypes.ANY:
              const translated = this.translate.instant(el[k]);
              if (!(translated && translated.includes && translated.toLowerCase().includes(this.columnFilter[k].toLowerCase()))) {
                include = false;
              }
              break;
            case IbTableTitlesTypes.STRING:
            case IbTableTitlesTypes.CUSTOM:
              if (!(el[k] && el[k].includes && el[k].toLowerCase().includes(this.columnFilter[k].toLowerCase()))) {
                include = false;
              }
              break;
            case IbTableTitlesTypes.NUMBER:
            case IbTableTitlesTypes.INPUT_NUMBER:
              for (const cond of this.columnFilter[k]) {
                include = eval(`(${el[k]} ${cond.condition} ${cond.value})`);
                if (!include) {
                  break;
                }
              }
              break;
            case IbTableTitlesTypes.DATE:
              for (const cond of this.columnFilter[k]) {
                const condDate = new Date(cond.value);
                const valueDate = new Date(el[k]);
                // we use formatDate according to format showed on table-row component template.
                include = eval(`('${formatDate(valueDate, 'yyyy-MM-dd', 'it')}' ${cond.condition} '${formatDate(condDate, 'yyyy-MM-dd', 'it')}')`);
                if (!include) {
                  break;
                }
              }
              break;
            case IbTableTitlesTypes.BOOLEAN:
              include = (el[k] === this.columnFilter[k]);
              break;
            default:
              include = true;
          }
          if (!include) {
            break;
          }

        }
        return include;
      });

    }
    this.numOfElements = this.sortedData.length;
    this.store.dispatch(ibTableActionSetPaginator({
      state: {
        length: this.sortedData.length,
        pageIndex: this.currentPagination.pageIndex,
        pageSize: this.currentPagination.pageSize
      },
      tableName: this.tableName
    }));

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

  setFilter(key, value, indexToSet = 0, redux = true, tableName = null) {
    this.columnFilter[key] = value;
    this.currentPagination.pageIndex = indexToSet;
    if (redux) {
      if (!tableName) {
        if (!tableName && this.tableName === 'default_table_name') {
          console.warn('[IbTableComponent] missing table name on redux filter call');
        }
        tableName = this.tableName;
      }

      // this.store.dispatch(TableFiltersActions.addFilterToTable({
      //   tableName,
      //   filterName: key,
      //   filterValue: value
      // }));

      this.pageChangeHandle(this.currentPagination);
      this.store.dispatch(ibTableActionAddFilterField({
        state: {
          columnName: key,
          value,
        },
        tableName
      }));
    }

  }

  resetFilters() {
    this.columnFilter = {};
  }

  pageChangeHandle(data) {
    // this.store.dispatch(TableFiltersActions.addPaginatorFiltersToTable({
    //   tableName: this.tableName,
    //   previousPageIndex: data.previousPageIndex,
    //   pageIndex: data.pageIndex,
    //   pageSize: data.pageSize,
    //   lengthP: data.length
    // }));

    this.store.dispatch(ibTableActionSetPaginator({
      state: {
        pageIndex: data.pageIndex,
        pageSize: data.pageSize,
        length: data.length
      },
      tableName: this.tableName
    }));
    // this.currentPagination = data;
    this._sortData(this.currentSort, false);
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
    this.filteredData = this.sortedData.slice();
    this.sortedData = paginatedData;
  }

  getSelectedRows() {
    return this.items.filter(sd => this.rowForm(sd).controls.isChecked.value);
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
      // this.store.dispatch(TableFiltersActions.addPaginatorFiltersToTable(pagination));

      this.store.dispatch(ibTableActionSetPaginator({
        state: {
          pageIndex: 0,
          pageSize: this.items.length,
          length: this.items.length,
        },
        tableName: this.tableName
      }));


      this.currentPagination = pagination;
      this.sortData(this.currentSort, false);
    }

    const keys = this.titles.map(h => h.key);
    const getValueFromKey = (row, key) => {
      const value = row[key];
      const h = this.titles.find(t => t.key === key);
      return value;
    };
    let filteredData = this.sortedData
      .map(
        row => Object.keys(row)
          .filter(key => keys.includes(key))
          .reduce((o, key) => ({
            ...o,
            [key]: getValueFromKey(row, key)
          }), {})
    );

    if (dataset === 'selected') {
      filteredData = this.getSelectedRows();
    }

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
}

function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
