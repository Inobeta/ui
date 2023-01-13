import { Component, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { applyFilter, contains, eq, lt, or } from './filters';
import { IbTable } from '../kai-table/table.component';
import { MatTabChangeEvent } from '@angular/material/tabs';

@Component({
  selector: 'ib-filter',
  template: `
  <section style="display: flex;">
    <mat-tab-group animationDuration="0ms" (selectedTabChange)="applyFilter($event)">
      <mat-tab *ngFor="let view of views" [label]="view.displayName"></mat-tab>
    </mat-tab-group>
    <button mat-icon-button color="primary"><mat-icon>add</mat-icon></button>
  </section>
  <mat-form-field style="width: 100%; padding-bottom: 0">
    <mat-label>Cerca in {{currentView}}</mat-label>
    <input matInput [(ngModel)]="searchBar" (ngModelChange)="filter()">
    <mat-icon matSuffix (click)="showFilters = !showFilters; $event.stopPropagation()">filter_list</mat-icon>
    <mat-icon matSuffix>save</mat-icon>
  </mat-form-field>
  <ib-filter-list *ngIf="showFilters" [availableFilters]="ibTable.displayedColumns" (ibUpdateFilter)="filter($event)"></ib-filter-list>
  `,
  styles: [`
mat-tab-group {
  width: min-content
}
  `]
})

export class IbFilter {
  @Input() ibTable: IbTable;

  showFilters = false;
  searchBar = '';

  currentView = 'All';
  currentFilterDef = {};
  views = [
    { displayName: 'All', filterDef: {} },
    { displayName: 'Exotic fruits', filterDef: { fruit: or([
      eq('kiwi'),
      eq('lychee'),
      eq('banana'),
      eq('pineapple'),
      eq('mango'),
    ]) } },
    { displayName: 'With less than 5 fruits', filterDef: { number: lt(5) } },
  ];

  constructor() { }

  ngAfterContentInit() {
    this.ibTable.dataSource.filterPredicate = this.filterPredicate;
  }

  applyFilter(event: MatTabChangeEvent) {
    const view = this.views.find(v => v.displayName === event.tab.textLabel);
    this.searchBar = '';
    this.showFilters = false;
    this.currentView = view.displayName;
    this.currentFilterDef = view.filterDef;
    this.ibTable.dataSource.filter = view.filterDef as any;
  }

  filter(newFilter = {}) {
    let filter = {
      ...this.currentFilterDef,
      ...newFilter,
    };

    if (this.searchBar) {
      filter = {
        __crossColumnFilter: contains(this.searchBar),
        ...this.currentFilterDef,
        ...filter,
      };
    }

    if (!this.searchBar.length) {
      filter = {
        __crossColumnFilter: null,
        ...filter,
      };
    }
    console.log(this.currentFilterDef);
    this.ibTable.dataSource.filter = filter as any;
  }

  reset() {
    this.ibTable.dataSource.filter = {} as any;
  }

  private filterPredicate = (data: any, filter: any) => {
    return Object.entries(data).every(([key, value]) => {
      const condition = filter[key];
      return applyFilter(condition, value) && this.evaluateCrossColumnFilter(data, filter);
    });
  }

  private evaluateCrossColumnFilter = (data: any, filter: Record<string, any>) => {
    if (!('__crossColumnFilter' in filter)) {
      return true;
    }

    if (!filter.__crossColumnFilter) {
      return true;
    }

    const dataStr = Object.keys(data as unknown as Record<string, any>)
      .reduce((currentTerm: string, key: string) => {
        // https://github.com/angular/components/blob/main/src/material/table/table-data-source.ts#L247
        return currentTerm + (data as unknown as Record<string, any>)[key] + '◬';
      }, '')
      .toLowerCase();

    return applyFilter(filter.__crossColumnFilter, dataStr);
  }
}
