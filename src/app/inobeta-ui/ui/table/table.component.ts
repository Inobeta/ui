import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Sort} from '@angular/material';
import {TableCellAligns, TableTitles, TableTitlesTypes} from './titles.model';
import {TemplateButtonModel} from './templateButton.model';

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
            <th
              *ngFor="let t of titles"
              [mat-sort-header]="t.key"
              style="white-space: nowrap;"
              class="table-header-title">{{ t.value | translate}}
            </th>
            <th
              width="10"
              style="white-space: nowrap;"
              class="table-header-title-custom"
              [mat-sort-header]="btn.columnName"
              disabled="true"
              *ngFor="let btn of templateButtons"
            >{{btn.columnName | translate}}</th>
          </tr>

          <tr class="table-row" *ngFor="let item of sortedData">

            <!--CHECKBOX-->
            <td *ngIf="!reduced && selectableRows">
              <mat-checkbox [(ngModel)]="item.checked"></mat-checkbox>
            </td>

            <td
              *ngFor="let t of titles"
              style="padding: 10px 15px;"
              [ngStyle]="{
                 'text-align': (t.align) ? t.align : alignEnum.LEFT
              }">

              <!--TYPE = ANY-->
              <span *ngIf="!t.type || t.type === typeEnum.ANY">
                {{item[t.key] | translate}}
              </span>

              <!--TYPE = NUMBER-->
              <span *ngIf="t.type === typeEnum.NUMBER">
                  {{item[t.key] | number:t.format:'it'}}
              </span>

              <!--TYPE = DATE-->
              <span *ngIf="t.type === typeEnum.DATE">
                {{item[t.key] | date: 'dd/MM/yyyy'}}
              </span>

              <!--TYPE = STRING-->
              <span *ngIf="t.type === typeEnum.STRING">
                {{item[t.key]}}
              </span>

              <!--TYPE = HOUR-->
              <span *ngIf="t.type === typeEnum.HOUR">
                {{item[t.key] | date: 'HH:mm:ss'}}
              </span>

              <!--TYPE = TAG-->
              <span *ngIf="t.type === typeEnum.TAG">
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
              <span *ngIf="t.type === typeEnum.COMBOBOX">
                {{ t.comboOptions[item[t.key]] | translate }}
              </span>

              <!--TYPE = BOOLEAN-->
              <span *ngIf="t.type === typeEnum.BOOLEAN">
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
      <ng-template #defaultPaginatorTemplate >
        <ib-table-paginator
          [hasPaginator]="hasPaginator"
          [items]="items"
          (pageChangeHandle)="pageChangeHandle($event)"
          [reduced]="reduced">
        </ib-table-paginator>
      </ng-template>
    </div>
    <mat-menu #menuTableActions="matMenu">
      <button mat-menu-item *ngFor="let a of actions" (click)="actionButtonClick(a)">{{ a | translate}}</button>
    </mat-menu>
  `,
  styleUrls: ['./table.component.css']
})
export class TableComponent implements OnChanges {

  // input necessari
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
  @Input() templateButtons: TemplateButtonModel[] = [];

  // input non necessari
  @Input() tags: string[] = [];
  @Input() reduced = false;
  @Input() displayInfo = true;
  @Input() actions: string[] = [];

  // Output necessari
  @Output() filterChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() filterReset: EventEmitter<any> = new EventEmitter<any>();
  @Output() sortChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() add: EventEmitter<any> = new EventEmitter<any>();
  @Output() deleteItem: EventEmitter<any> = new EventEmitter<any>();

  @Output() arrowClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() actionsClick: EventEmitter<any> = new EventEmitter<any>();

  /*objectKeys = Object.keys;*/
  filterableTitles: TableTitles[] = [];
  typeEnum = TableTitlesTypes;
  alignEnum = TableCellAligns;
  sortedData;
  currentPagination;

  ngOnChanges(changes: SimpleChanges): void {

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
        pageIndex: 0,
        pageSize: 10,
        length: this.sortedData.length
      });
    }
  }

  sortData(sort: Sort, emitChange: boolean = true) {
    if (emitChange) {
      this.sortChange.emit(sort);
    }
    this.currentSort = sort;
    // data diventa la copia dell'array di elem
    const data = this.items.slice();
    if (!sort.active || sort.direction === '') {
      this.currentSort = {};
      this.sortedData = this.items;
      this.paginationHandle();
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      return compare(a[sort.active], b[sort.active], isAsc);
    });

    this.paginationHandle();
  }

  pageChangeHandle(data) {
    this.currentPagination = data;
    this.sortedData = this.items.slice(); // copia dell'intero array
    if (Object.keys(this.currentSort).length !== 0) {
      this.sortData(this.currentSort, false);
    } else {
      this.paginationHandle();
    }
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
}

function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
