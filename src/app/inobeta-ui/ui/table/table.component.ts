import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {Sort} from '@angular/material';
import {TableTitles, TableTitlesTypes} from './titles.model';

@Component({
  selector: 'ib-table',
  template: `
    <div fxLayout="column" >
      <div *ngIf="!reduced" fxLayout="row" fxLayoutAlign="left center" fxLayoutGap="20px">
        <div *ngFor="let filter of filterableTitles">
            <span *ngIf="filter.type === typeEnum.CHANNEL">
              <mat-form-field>
                <mat-select
                  placeholder="{{ filter.value | translate }}"
                  multiple
                  [value]="filterValues[filter.key]"
                  (selectionChange)="onFilterChange.emit({
                    key: filter.key,
                    data: $event.value
                })">
                  <mat-option *ngFor="let color of objectKeys(filter.colors)" [value]="color">
                    {{ color | translate}}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </span>
          <span *ngIf="filter.type === typeEnum.TAG">
              <mat-form-field>
                <mat-select
                  placeholder="{{ filter.value | translate }}"
                  multiple
                  [value]="filterValues[filter.key]"
                  (selectionChange)="onFilterChange.emit({
                    key: filter.key,
                    data: $event.value
                })">
                  <mat-option *ngFor="let tag of tags" [value]="tag">
                    {{ 'common.'+tag | translate}}
                  </mat-option>
                </mat-select>
              </mat-form-field>
            </span>
        </div>
        <div >
          <mat-form-field>
            <input matInput placeholder="{{ 'shared.ui.table.search' | translate }}" [value]="filterValues['generic']" (change)="onFilterChange.emit({
                key: 'generic',
                data: $event
              })"  />
            <i class="material-icons" matSuffix>search</i>
          </mat-form-field>
        </div>
        <div fxFlex fxLayout="row" fxLayoutAlign="end center" fxLayoutGap="20px">
          <div
            (click)="csvExport()"
            fxLayout="row"
            fxLayoutAlign="center center"
            style="cursor:pointer; border: 1px solid gray; border-radius: 20px; padding: 5px;padding-left: 10px;padding-right: 15px;">
            <i class="material-icons">call_made</i> {{ 'shared.ui.table.csv' | translate }}
          </div>
          <div fxLayout="row" fxLayoutAlign="center center" style="border: 1px solid gray; border-radius: 20px; padding: 5px;padding-left: 10px;padding-right: 15px;">
            <i class="material-icons">touch_app</i> {{ 'shared.ui.table.actions' | translate }}
            <i class="material-icons" style="cursor:pointer;" [matMenuTriggerFor]="menuTableActions" >keyboard_arrow_down</i>
          </div>
          <div
            (click)="onFilterReset.emit()"
            fxLayout="row"
            fxLayoutAlign="center center"
            style="color:white;background-color:#f2536e; cursor:pointer; border: 0px; border-radius: 20px; padding: 5px;padding-left: 10px;padding-right: 15px;">
            <i class="material-icons">restore</i> {{ 'shared.ui.table.filter_reset' | translate }}
          </div>
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
            <th width="10" *ngIf="!reduced"></th>
            <th width="10" *ngIf="!reduced"></th>
            <th *ngFor="let t of titles" [mat-sort-header]="t.key" style="white-space: nowrap;">{{ t.value | translate}}</th>
            <th width="10" *ngIf="!reduced && displayInfo"></th>
            <th width="10" *ngIf="!reduced"></th>
          </tr>

          <tr *ngFor="let item of sortedData">
            <td *ngIf="!reduced"><mat-checkbox [(ngModel)]="item.checked"></mat-checkbox></td>
            <td *ngIf="!reduced">
              <i class="material-icons"
                 style="cursor:pointer"
                 (click)="onPointsClick.emit(item)">more_vert</i>
            </td>
            <td *ngFor="let t of titles" style="padding: 15px;padding-top: 10px; padding-bottom: 10px;">
              <span *ngIf="!t.type || t.type === typeEnum.ANY" >{{item[t.key] | translate}}</span>
              <span *ngIf="t.type === typeEnum.NUMBER" >{{item[t.key] | number:t.format:'it'}}</span>
              <span *ngIf="t.type === typeEnum.DATE">{{item[t.key] | date: 'dd/MM/yyyy'}}</span>
              <span *ngIf="t.type === typeEnum.HOUR">{{item[t.key] | date: 'HH:mm:ss'}}</span>
              <span *ngIf="t.type === typeEnum.TAG">
                 <mat-chip-list>
                   <mat-chip *ngFor="let tag of item[t.key]" style="background-color: #f2536e; color:white !important; text-transform: uppercase;">
                     {{ 'common.' + tag | translate }}
                   </mat-chip>
                 </mat-chip-list>
               </span>
              <span *ngIf="t.type === typeEnum.CHANNEL">
                 <ul style="text-align: left; padding-left: 15px;"><li [ngStyle]="{color: t.colors[item[t.key]]}">{{item[t.key]}}</li></ul>
               </span>

              <span *ngIf="t.type === typeEnum.QUALITY">
                 <span *ngIf="item[t.key] === 0" [ngStyle]="{color: 'orange'}"> {{ 'shared.entities.quality.progress' | translate }}</span>
                 <span *ngIf="item[t.key] === 1" [ngStyle]="{color: 'green'}"> {{ 'shared.entities.quality.ok' | translate }}</span>
                 <span *ngIf="item[t.key] === 2" [ngStyle]="{color: 'red'}"> {{ 'shared.entities.quality.fail' | translate }}</span>
               </span>

            </td>
            <td *ngIf="!reduced && displayInfo">
              <i
                class="material-icons"
                style="color:#3ca6f5; cursor:pointer;"
                (click)="onInfoClick.emit(item)"
              >info_outline</i>
            </td>
            <td *ngIf="!reduced">
              <i
                class="material-icons"
                style="color:#5a6dd8; cursor: pointer;"
                (click)="onArrowClick.emit(item)"
              >play_circle_outline</i>
            </td>
          </tr>
          <tr *ngIf="sortedData.length == 0">
            <td [attr.colspan]="4+titles.length" style="text-align: center;">
              <br><br>{{ 'shared.ui.table.no_data' | translate }}<br><br>
            </td>
          </tr>
        </table>
      </div>
      <div *ngIf="!reduced">
        <mat-paginator
          style="margin-top: 10px;"
          [length]="items.length"
          [pageSize]="(!reduced) ? 10 : items.length"
          [pageSizeOptions]="[5, 10, 25, 100]"
          [showFirstLastButtons]="true"
          (page)="pageChangeHandle($event)"
        >
        </mat-paginator>
      </div>
    </div>


    <mat-menu #menuTableActions="matMenu">
      <button mat-menu-item *ngFor="let a of actions" (click)="actionButtonClick(a)" >{{ a | translate}}</button>
    </mat-menu>
  `,
  styles: [
      `
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
      th >>> button.mat-sort-header-button{
        text-transform: uppercase !important;
      }

      td{
        border-bottom: 1px solid #ccc;
        padding: 10px;
      }


      mat-paginator >>> .mat-paginator-container{
        justify-content: flex-start !important;
      }

      mat-paginator >>> button{
        transform: scale(0.8);
      }

      mat-paginator >>> .mat-form-field-underline{
        display: none;
      }
      mat-paginator >>> .mat-input-flex{
        background-color: gray;
        border-radius: 10px;
        padding-left: 15px;
        padding-right: 10px;
        padding-bottom: 0px;
        margin-top: 10px;
      }

      mat-paginator >>> span,
      mat-paginator >>> .mat-select-arrow{
        color: white !important;
      }

      mat-paginator >>> .mat-input-infix{
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

  // input non necessari
  @Input() tags: string[] = [];
  @Input() reduced = false;
  @Input() displayInfo = true;
  @Input() actions: string[] = [];

  // Output necessari
  @Output() onFilterChange: EventEmitter<any> = new EventEmitter<any>();
  @Output() onFilterReset: EventEmitter<any> = new EventEmitter<any>();
  @Output() onSortChange: EventEmitter<any> = new EventEmitter<any>();


  // Output da creare
  /*
  * onSelectedItem  -> emit dell'item selezionato
  *
  * **/

  // Output non necessari
  @Output() onInfoClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() onPointsClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() onArrowClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() onActionsClick: EventEmitter<any> = new EventEmitter<any>();

  objectKeys = Object.keys;
  filterableTitles: TableTitles[] = [];
  typeEnum = TableTitlesTypes;
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
    if (emitChange) { this.onSortChange.emit(sort); }
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
    if (this.currentSort) { this.sortData(this.currentSort, false); } else { this.paginationHandle(); }
  }


  paginationHandle() {
    const data = this.currentPagination;
    const paginatedData = [];
    for (let i = data.pageIndex * data.pageSize; i < (data.pageIndex + 1) * data.pageSize; i++) {
      if (i >= this.sortedData.length) { break; }
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
    this.onActionsClick.emit({
      action: a,
      data: this.sortedData.filter((el) => el.checked)
    });
  }
}

function compare(a, b, isAsc) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
