import { Component, Input, OnChanges } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';

@Component({
  selector: 'ib-table-header-popup',
  template: /*template*/`
  <div class="modal-selector" (click)="$event.stopPropagation();">
      <div class="modal-row" (click)="ibTable.sortData({active: col.key, direction: 'asc'})">
        {{ 'shared.tableHeaderPopup.sort' | translate}}
        <i class="material-icons modal-icons">arrow_upward</i>
      </div>
      <div class="modal-row" (click)="ibTable.sortData({active: col.key, direction: 'desc'})">
        {{ 'shared.tableHeaderPopup.sort' | translate}}
        <i class="material-icons modal-icons">arrow_downward</i>
      </div>
      <div class="modal-row" >
        <div fxLayout="row">
          <input
            #searchInput
            autocomplete="off"
            matInput
            [placeholder]="'shared.tableHeaderPopup.filter' | translate"
            (keyup)="search(searchInput.value)"
            />
          <i
          class="material-icons modal-icons"
          (click)="search(searchInput.value)"
          >search</i>
        </div>
      </div>
<!--
      <div class="modal-row" >
        {{ 'shared.tableHeaderPopup.elementsToFilter' | translate}}
      </div>-->
    </div>
    <!--<div class="modal-selector inner-modal">
      <div
        class="modal-row"
        *ngFor="let item of filterDistinct"
        (click)="ibTable.setFilter(col.key, item);"
        >
        {{ item }}
      </div>
    </div>-->
  `,
  styles: [
    `
      .modal-selector {
        position: absolute;
        width: 200px;
        max-height: 300px;
        overflow-y: auto;
        background-color: white;
        -webkit-box-shadow: 40px 20px 70px 0 rgba(0, 0, 0, 0.49);
        -moz-box-shadow: 40px 20px 70px 0 rgba(0, 0, 0, 0.49);
        box-shadow: 40px 20px 70px 0 rgba(0, 0, 0, 0.49);
        color: black;
        z-index: 100;
      }

      .modal-row {
        font-family: 'Red Hat Text';
        font-weight: bold;
        size: 18px;
        color: #999999;
        padding: 10px;
        padding-right: 20px;
        padding-left: 20px;
      }

      .mat-input-element {
        font-family: 'Red Hat Text' !important;
      }

      .modal-row:hover, .modal-row-active {
        background-color: #F7F7F7;
      }

      .modal-icons {
        float: right;
        size: 10px;
        font-weight: normal;
      }

      .inner-modal {
        margin-left: 200px;
        margin-top: 125px;
        width: 300px;
      }

      .inner-modal .modal-row {
        overflow-x: hidden;
        text-overflow: ellipsis;
      }

    `

  ]

})
export class IbTableHeaderPopupComponent implements OnChanges {

  @Input() ibTable: any;
  @Input() col: any;

  searchSubject = new Subject();
  filterDistinct: any[] = [];
  constructor() {
    this.searchSubject.pipe(
      debounceTime(700)
    ).subscribe((text) => this.doFilter(text));
  }

  doFilter(text) {
    this.ibTable.setFilter(this.col.key, text);
  }

  search(what) {
    this.searchSubject.next(what);
  }

  ngOnChanges(changes: import('@angular/core').SimpleChanges): void {
    if (changes.ibTable && changes.ibTable.currentValue) {
      this.alignFilterDistinct(changes.ibTable.currentValue.items);
    }
  }

  alignFilterDistinct(items) {
    this.filterDistinct = [... new Set(items.map(i => i[this.col.key]))].sort();
  }


}
