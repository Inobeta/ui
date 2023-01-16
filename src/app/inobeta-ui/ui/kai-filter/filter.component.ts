import { AfterContentInit, Component, ContentChildren, QueryList } from '@angular/core';
import { applyFilter, contains } from './filters';
import { IbTable } from '../kai-table/table.component';
import { IbFilterBase } from './filter-base/filter-base';

@Component({
  selector: 'ib-filter',
  template: `
    <mat-form-field style="width: 100%; padding-bottom: 0">
      <mat-icon matPrefix>search</mat-icon>
      <input matInput [(ngModel)]="searchBar" (ngModelChange)="filter()" [placeholder]="'Cerca in ' + currentView"/>
      <mat-icon
        matSuffix
        (click)="showFilters = !showFilters; $event.stopPropagation()"
        >filter_list</mat-icon
      >
    </mat-form-field>
    <ib-filter-list
      *ngIf="showFilters"
      [availableFilters]="displayedColumns"
      (ibUpdateFilter)="filter($event)"
    >
    <ng-content></ng-content>
  </ib-filter-list>
  `,
  styles: [
    `
      mat-tab-group {
        width: min-content;
      }
    `,
  ],
})
export class IbFilter implements AfterContentInit {
  @ContentChildren(IbFilterBase) filterTemplates: QueryList<IbFilterBase>;
  
  showFilters = true;
  searchBar = '';

  currentView = 'All';
  currentFilterDef = {};

  get displayedColumns() {
    return this.ibTable.displayedColumns.filter((c) => !c.startsWith('_'));
  }

  constructor(private ibTable: IbTable) { }

  ngAfterContentInit() {
    this.ibTable.dataSource.filterPredicate = this.filterPredicate;
  }

  applyFilter(view: Record<string, any>) {
    this.searchBar = '';
    this.showFilters = false;
    this.currentView = view.displayName;
    this.currentFilterDef = view.filter;
    this.ibTable.dataSource.filter = view.filter as any;
  }

  filter(newFilter = {}) {
    let crossColumnFilter;
    if (this.searchBar) {
      crossColumnFilter = contains(this.searchBar);
    }
    const filter = {
      __crossColumnFilter: crossColumnFilter,
      ...this.currentFilterDef,
      ...newFilter,
    };
    this.ibTable.dataSource.filter = filter as any;
  }

  reset() {
    this.ibTable.dataSource.filter = {} as any;
  }

  private filterPredicate = (data: any, filter: any) => {
    return Object.entries(data).every(([key, value]) => {
      const condition = filter[key];
      return (
        applyFilter(condition, value) &&
        this.evaluateCrossColumnFilter(data, filter)
      );
    });
  }

  private evaluateCrossColumnFilter = (
    data: any,
    filter: Record<string, any>
  ) => {
    if (!('__crossColumnFilter' in filter)) {
      return true;
    }

    if (!filter.__crossColumnFilter) {
      return true;
    }

    const dataStr = Object.keys(data as unknown as Record<string, any>)
      .reduce((currentTerm: string, key: string) => {
        // https://github.com/angular/components/blob/main/src/material/table/table-data-source.ts#L247
        return (
          currentTerm + (data as unknown as Record<string, any>)[key] + '◬'
        );
      }, '')
      .toLowerCase();

    return applyFilter(filter.__crossColumnFilter, dataStr);
  }
}
