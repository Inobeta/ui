import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, HostListener } from '@angular/core';
import { Sort } from '@angular/material';
import { TableCellAligns, TableTitles, TableTitlesTypes } from './titles.model';
import { TemplateModel } from './template.model';
import { Store } from '@ngrx/store';
import * as TableFiltersActions from './redux/table.action';

@Component({
  selector: 'ib-table',
  template: `
    <div fxLayout="column" class="ib-table">
      <div *ngIf="!reduced" fxLayout="row" fxLayoutAlign="left center" fxLayoutGap="20px">
        <ib-table-search
          [filterValues]="filterValues"
          (filterChange)="filterChange.emit($event)"
          [hasSearch]="hasSearch">
        </ib-table-search>
        <div fxFlex fxLayout="row" fxLayoutAlign="end center" fxLayoutGap="20px">
          <ib-table-export-csv
            (exportCsv)="csvExport()"
            [hasCsvExport]="hasCsvExport">
          </ib-table-export-csv>
          <ib-table-menu-actions
            [menuTableActions]="menuTableActions"
            [actionsLength]="actions.length"
            [hasActions]="hasActions">
          </ib-table-menu-actions>
          <ib-table-add-button
            [hasAdd]="hasAdd"
            (add)="add.emit()">
          </ib-table-add-button>
          <ib-table-filter-reset-button
            (filterReset)="filterReset.emit()"
            [hasFilterReset]="hasFilterReset">
          </ib-table-filter-reset-button>
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
          <tr class="table-header">
            <th id="select-row-name" width="10" *ngIf="!reduced && selectableRows">{{selectRowName | translate}}</th>
            <ng-template
              *ngFor="let t of titles"
              [ngIf]="true"
            >
              <th
                style="white-space: nowrap;"
                class="table-header-title"
                width="{{t.width}}"
                [mat-sort-header]="t.key"
                *ngIf="!templateHeaders[t.key]"
              >
                {{ t.value | translate}}
                <ng-template
                  [ngIf]="columnFilter[t.key]"
                >
                  [{{columnFilter[t.key]}}]
                  <i
                    style="font-size: 14px;font-weight: bolder;cursor:pointer"
                    class="material-icons"
                    (click)="$event.stopPropagation(); setFilter(t.key, null);"
                  >close</i>
                </ng-template>
              </th>
              <th
                style="white-space: nowrap;"
                class="table-header-title"
                width="{{t.width}}"
                *ngIf="templateHeaders[t.key]"
                (click)="resetCustomHeaderVisibility($event); visibleHeaders[t.key] = !visibleHeaders[t.key]"
              >
                {{ t.value | translate}}
                <ng-template
                  [ngIf]="columnFilter[t.key]"
                >
                  [{{columnFilter[t.key]}}]
                  <i
                    style="font-size: 14px;font-weight: bolder;cursor:pointer"
                    class="material-icons"
                    (click)="$event.stopPropagation(); setFilter(t.key, null);"
                  >close</i>
                </ng-template>
                <i class="material-icons table-sort-indicator"
                   style="font-size: 14px;font-weight: bolder;"
                   *ngIf="currentSort && currentSort.active==t.key && currentSort.direction=='asc'"
                >
                  arrow_upward
                </i>
                <i class="material-icons table-sort-indicator"
                   style="font-size: 14px;font-weight: bolder;"
                   *ngIf="currentSort && currentSort.active==t.key && currentSort.direction=='desc'"
                >
                  arrow_downward
                </i>
                <ng-template [ngIf]="visibleHeaders[t.key]">
                  <ng-container
                    *ngTemplateOutlet="templateHeaders[t.key]; context: { ibTable: this, col: t}">
                  </ng-container>
                </ng-template>
              </th>
            </ng-template>

            <th
              width="10"
              style="white-space: nowrap;"
              class="table-header-title-custom"
              [mat-sort-header]="btn.columnName"
              disabled="true"
              *ngFor="let btn of templateButtons"
            >{{btn.columnName | translate}}
            </th>
          </tr>

          <tr (click)="rowClicked.emit(item)" class="table-row" *ngFor="let item of sortedData">

            <!--CHECKBOX-->
            <td *ngIf="!reduced && selectableRows">
              <mat-checkbox #c (click)="emitItemAndCheckbox(item, !c.checked)"></mat-checkbox>
            </td>

            <td
              *ngFor="let t of titles"
              style="padding: 10px 15px;"
              [ngStyle]="{
                 'text-align': (t.align) ? t.align : alignEnum.LEFT
              }"
              [ngClass]="(t.getClassByCondition) ? t.getClassByCondition(item) : null">

              <!--TYPE = ANY-->
              <span *ngIf="!t.type || t.type === typeEnum.ANY" class="{{t.className}}}">
                {{item[t.key] | translate}}
              </span>

              <!--TYPE = NUMBER-->
              <span *ngIf="t.type === typeEnum.NUMBER" class="{{t.className}}">
                  {{item[t.key] | number:t.format:'it'}}
              </span>

              <!--TYPE = DATE-->
              <span *ngIf="t.type === typeEnum.DATE" class="{{t.className}}">
                {{item[t.key] | date: 'dd/MM/yyyy'}}
              </span>

              <!--TYPE = STRING-->
              <span *ngIf="t.type === typeEnum.STRING" class="{{t.className}}">
                {{item[t.key]}}
              </span>

              <!--TYPE = HOUR-->
              <span *ngIf="t.type === typeEnum.HOUR" class="{{t.className}}">
                {{item[t.key] | date: 'HH:mm:ss'}}
              </span>

              <!--TYPE = TAG-->
              <span *ngIf="t.type === typeEnum.TAG" class="{{t.className}}">
                 <mat-chip-list>
                   <mat-chip
                     *ngFor="let tag of item[t.key]"
                     style="
                        background-color: #f2536e;
                        color:white !important;
                        text-transform: uppercase;">
                     {{ 'common.' + tag | translate }}
                   </mat-chip>
                 </mat-chip-list>
               </span>

              <!--TYPE = COMBOBOX-->
              <span *ngIf="t.type === typeEnum.COMBOBOX" class="{{t.className}}">
                {{ t.comboOptions[item[t.key]] | translate }}
              </span>

              <!--TYPE = MATERIAL_SELECT-->
              <span *ngIf="t.type === typeEnum.MATERIAL_SELECT" class="{{t.className}}">
                <mat-form-field>
                <mat-select [(value)]="item[t.key]">
                  <mat-option *ngFor="let opt of t.materialSelectItems" [value]="opt.value">
                    {{opt.label | translate}}
                  </mat-option>
                </mat-select>
              </mat-form-field>
              </span>

              <!--TYPE = BOOLEAN-->
              <span *ngIf="t.type === typeEnum.BOOLEAN" class="{{t.className}}">
                <i
                  class="material-icons"
                  style="color:green;"
                  *ngIf="item[t.key] === true">check
                </i>
                <i
                  class="material-icons"
                  style="color:gray;"
                  *ngIf="item[t.key] === false">clear
                </i>
               </span>

              <!--TYPE = INPUT-->
              <span *ngIf="t.type === typeEnum.INPUT_NUMBER" class="{{t.className}}">
                <mat-form-field>
                  <input
                    [(ngModel)]="item[t.key]"
                    matInput
                    type="number"
                    placeholder="{{ t.placeHolderInput | translate }}"
                    value="{{item[t.key]}}">
                  </mat-form-field>
              </span>

              <!--TYPE = CUSTOM-->
              <span *ngIf="t.type === typeEnum.CUSTOM" class="{{t.className}}">
                <ng-container
                  *ngTemplateOutlet="customItemTemplate[t.key]; context: { item: item}">
              </ng-container>
              </span>
            </td>
            <td style="text-align: center" *ngFor="let btn of templateButtons">
              <ng-container
                *ngTemplateOutlet="btn.template; context: { item: item}">
              </ng-container>
            </td>

          </tr>

          <tr *ngIf="sortedData.length === 0">
            <td [attr.colspan]="4+titles.length" style="text-align: center;">
              <br><br>{{ 'shared.ibTable.noData' | translate }}<br><br>
            </td>
          </tr>
        </table>
      </div>
      <ng-container
        *ngTemplateOutlet="((paginatorTemplate != null) ? paginatorTemplate : defaultPaginatorTemplate);
        context: this"
      ></ng-container>
      <ng-template #defaultPaginatorTemplate>
        <ib-table-paginator
          *ngIf="hasPaginator"
          [numOfElements]="numOfElements"
          [paginationInfo]="currentPagination"
          (pageChangeHandle)="pageChangeHandle($event)"
          [reduced]="reduced"
          [elemForPage]="currentPagination.pageSize">
        </ib-table-paginator>
      </ng-template>
    </div>
    <mat-menu #menuTableActions="matMenu">
      <button mat-menu-item *ngFor="let a of actions" (click)="actionButtonClick(a)">{{ a | translate}}</button>
    </mat-menu>
    <!--overlay pane for custom headers popups--->
    <div
      class="ib-table-overlay"
      *ngIf="hasCustomHeadersVisible()"
      style="position:fixed; top:0px; left:0px;width:100%; height:100%; z-index:99; background-color:transparent;"
    ></div>
  `,
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnChanges {

  // input necessari
  @Input() customItemTemplate: any;
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
  /** { columnName: TemplateRef } */
  @Input() tableName = 'default_table_name';

  // input non necessari
  @Input() tags: string[] = [];
  @Input() reduced = false;
  @Input() displayInfo = true;
  @Input() actions: string[] = [];
  @Input() tableFilters: any;

  // Output necessari
  @Output() filterChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() filterReset: EventEmitter<any> = new EventEmitter<any>();
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
  visibleHeaders = {};
  columnFilter = {};
  numOfElements = 0;

  constructor(private store: Store<any>) { }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    // tslint:disable-next-line: forin
    for (const el in this.visibleHeaders) {
      event.stopPropagation();
      break;
    }
    this.resetCustomHeaderVisibility();
  }

  hasCustomHeadersVisible() {
    return Object.keys(this.visibleHeaders).length > 0;
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (changes && changes.tableFilters && changes.tableFilters.currentValue) {
      const data = changes.tableFilters.currentValue[this.tableName];
      // questo mette a posto il paginator
      if (data.paginatorFilters) {
        this.currentPagination = data.paginatorFilters;
      } else {
        this.currentPagination = {
          pageIndex: 0,
          pageSize: 10,
          previousPageIndex: 0
        };
      }
      // questo mette a posto i filtri
      for (const prop of Object.keys(data)) {
        if (prop !== 'paginatorFilters') {
          // filtri input
          this.setFilter(prop, data[prop].value, this.currentPagination.pageIndex);
          // ordinamento colonne
          if (data[prop].columnSort) {
            this.sortData(data[prop].columnSort.sort, data[prop].columnSort.emitChange);
          }
        }
      }
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
        emitChange: emitChange
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
      previousPageIndex: data.previousPageIndex | 0,
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

  csvExport() {
    const headerMap = this.titles.map((el) => el.key);
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: false,
      useBom: true,
      headers: headerMap
    };

    /*new Angular2Csv(this.sortedData.map((el) => {
      const retEl = {}
      headerMap.map((h) => {
        retEl[h] = (el[h] !== undefined) ? el[h] : ''
      })
      return retEl
    }), 'Export Data', options);*/
  }

  actionButtonClick(a) {
    this.actionsClick.emit({
      action: a,
      data: this.sortedData.filter((el) => el.checked)
    });
  }

  resetCustomHeaderVisibility(event = null) {
    if (event) {
      event.stopPropagation();
    }
    this.visibleHeaders = {};
  }

  emitItemAndCheckbox(item, checkbox) {
    this.rowChecked.emit({ item, isChecked: checkbox });
  }
}

function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
