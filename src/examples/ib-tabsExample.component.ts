import {Component} from '@angular/core';
import {IbTabsItem} from '../app/inobeta-ui/ui/ib-tabs/ib-tabs.component';

Component({
  template: `
    <ib-tabs
      [tabs]="tabs"
      (onTabSelect)="stampa($event)">
    </ib-tabs>
  `
});
export class TablePrimeExampleComponent {
  tabs: IbTabsItem[];
  constructor() {
    this.tabs = [
      {
        name: 'uno',
        active: false
      },
      {
        name: 'due',
        active: false
      },
      {
        name: 'tre',
        active: false
      },
    ];
  }

  stampa(item) {
    console.log(item);
  }
}
