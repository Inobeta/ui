import { Component} from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { or, eq, lt } from '../kai-filter/filters';
import { IbTable } from '../kai-table/table.component';
import { IbTableView } from './types';

@Component({
  selector: 'ib-table-view',
  template: `
  <section style="display: flex;">
    <mat-tab-group animationDuration="0ms" (selectedTabChange)="changeView($event)">
      <mat-tab *ngFor="let view of views" [label]="view.displayName"></mat-tab>
    </mat-tab-group>
    <button mat-icon-button color="primary"><mat-icon>add</mat-icon></button>
  </section>`
})

export class IbTableViewGroup {
  views: IbTableView[] = [
    { id: 0, tableName: 'fullExample', displayName: 'All', filter: {} },
    { id: 1, tableName: 'fullExample', displayName: 'Exotic fruits', filter: { fruit: or([
      eq('kiwi'),
      eq('lychee'),
      eq('banana'),
      eq('pineapple'),
      eq('mango'),
    ]) } },
    { id: 2, tableName: 'fullExample', displayName: 'With less than 5 fruits', filter: { number: lt(5) } },
  ];

  constructor(private ibTable: IbTable) {}

  changeView(event: MatTabChangeEvent) {
    const view = this.views.find(v => v.id === event.index);
    this.ibTable.filter.applyFilter(view);
  }
}
