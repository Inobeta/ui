import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Sort} from '@angular/material';
import {TableCellAligns, TableTitles, TableTitlesTypes} from './titles.model';

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
            [actionsLength]="actions.length">
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
          <tr>
            <th width="10" *ngIf="!reduced && selectableRows"></th>
            <th *ngFor="let t of titles" [mat-sort-header]="t.key" style="white-space: nowrap;">
              {{ t.value | translate}}
            </th>
            <th width="10" *ngIf="!reduced"></th>
          </tr>

          <tr *ngFor="let item of sortedData">
            <td *ngIf="!reduced && selectableRows">
              <mat-checkbox [(ngModel)]="item.checked"></mat-checkbox>
            </td>
            <td *ngFor="let t of titles"
                style="padding: 15px;padding-top: 10px; padding-bottom: 10px;"
                [ngStyle]="{
                  'text-align': (t.align) ? t.align : alignEnum.LEFT
                }"
            >
              <span *ngIf="!t.type || t.type === typeEnum.ANY"
              >{{item[t.key] | translate}}</span>
              <span *ngIf="t.type === typeEnum.NUMBER">
                {{item[t.key] | number:t.format:'it'}}
              </span>
              <span *ngIf="t.type === typeEnum.DATE">{{item[t.key] | date: 'dd/MM/yyyy'}}</span>
              <span *ngIf="t.type === typeEnum.CUSTOMDATE">{{item[t.key] | date: 'dd/MM/yyyy'}}</span>
              <span *ngIf="t.type === typeEnum.HOUR">{{item[t.key] | date: 'HH:mm:ss'}}</span>
              <span *ngIf="t.type === typeEnum.TAG">
                 <mat-chip-list>
                   <mat-chip *ngFor="let tag of item[t.key]"
                             style="background-color: #f2536e; color:white !important; text-transform: uppercase;">
                     {{ 'common.' + tag | translate }}
                   </mat-chip>
                 </mat-chip-list>
               </span>

              <span *ngIf="t.type === typeEnum.COMBOBOX">
                {{ t.comboOptions[item[t.key]] | translate }}
              </span>
              <span *ngIf="t.type === typeEnum.BOOLEAN">
                <i
                  class="material-icons"
                  style="color:green;"
                  *ngIf="item[t.key] === true"
                >check</i>
                <i
                  class="material-icons"
                  style="color:gray;"
                  *ngIf="item[t.key] === false"
                >clear</i>
               </span>

            </td>
            <td *ngIf="!reduced">
              <i
                class="hover material-icons"
                style="color:#5a6dd8; cursor: pointer;"
                (click)="arrowClick.emit(item)"
              >play_circle_outline</i>
            </td>
          </tr>
          <tr *ngIf="sortedData.length == 0">
            <td [attr.colspan]="4+titles.length" style="text-align: center;">
              <!--<br><br>{{ 'shared.ui.table.no_data' | translate }}<br><br>-->
            </td>
          </tr>
        </table>
      </div>
      <div *ngIf="!reduced">
        <mat-paginator
          style="margin-top: 10px;background-color: transparent;"
          [length]="items.length"
          [pageSize]="(!reduced) ? 10 : items.length"
          [pageSizeOptions]="[5, 10, 25, 100]"
          [showFirstLastButtons]="true"
          (page)="pageChangeHandle($event)">
        </mat-paginator>
      </div>
    </div>


    <mat-menu #menuTableActions="matMenu">
      <button mat-menu-item *ngFor="let a of actions" (click)="actionButtonClick(a)">{{ a | translate}}</button>
    </mat-menu>
  `,
  styles: [
      `
      ib-table .hover:hover{
        opacity: .5 !important;
      }
      .mat-sort-header-container {
        align-items: center;
      }

      th {
        color: #555;
        font-weight: normal;
        border-bottom: 2px solid #ccc;
        padding: 15px;
        margin-bottom: 20px;
      }

      th >>> button.mat-sort-header-button {
        text-transform: uppercase !important;
      }

      td {
        border-bottom: 1px solid #ccc;
        padding: 10px;
      }

      mat-paginator >>> .mat-paginator-container {
        justify-content: flex-start !important;
        background-color: inherit;
      }

      mat-paginator >>> button {
        transform: scale(0.8);
      }

      mat-paginator >>> .mat-form-field-underline {
        display: none;
      }

      mat-paginator >>> .mat-input-flex {
        background-color: gray;
        border-radius: 10px;
        padding-left: 15px;
        padding-right: 10px;
        padding-bottom: 0px;
        margin-top: 10px;
      }


      mat-paginator >>> .mat-input-infix {
        border-top: 0px !important;
      }

      /*td span{
        display: block;
        padding: 10px;
      }*/

      /*
            .mat-sort-header-container{
              justify-content: center;
            }*/
    `
  ]
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

  @Output() arrowClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() actionsClick: EventEmitter<any> = new EventEmitter<any>();

  objectKeys = Object.keys;
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
    const data = this.items.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
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
    this.sortedData = this.items.slice();
    if (this.currentSort) {
      this.sortData(this.currentSort, false);
    } else {
      this.paginationHandle();
    }
  }


  paginationHandle() {
    const data = this.currentPagination;
    const paginatedData = [];
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

    // new Angular2Csv(this.sortedData.map((el) => {
    //   const retEl = {}
    //   headerMap.map((h) => {
    //     retEl[h] = (el[h] !== undefined) ? el[h] : ''
    //   })
    //   return retEl
    // }), 'Export Data', options);
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
