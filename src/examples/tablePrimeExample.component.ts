import {Component} from '@angular/core';
import {TableTitlesTypes} from '../app/inobeta-ui/ui/table/titles.model';

Component({
  template: `
    <ib-table-prime
      [titles]="titles"
      [items]="users"
      [filterValues]="filterValues"
      [currentSort]="currentSort"
      (onFilterChange)="applyFilters($event)"
      (onSortChange)="applySortable($event)"
      (onCheckboxSelectionChange)="logData($event)"
      (onItemSelect)="logData($event)">
    </ib-table-prime>
  `
});
export class TablePrimeExampleComponent {

  filterValues: any;
  currentSort: any;
  titles: any;
  users: any;

  constructor() {
    this.filterValues = {};
    this.titles = [
      {
        key: 'checked',
        value: '',
        type: TableTitlesTypes.CHECKBOX,
        filterable: false
      },
      {
        key: 'name',
        value: 'entities.user.name',
        type: TableTitlesTypes.ANY,
        filterable: true
      },
      {
        key: 'surname',
        value: 'entities.user.surname',
        type: TableTitlesTypes.ANY,
        filterable: true
      }
    ];
    this.users = [
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'},
      {name: 'pippo', surname: 'franco'}
    ];
  }

  applyFilters(data) {
    this.filterValues = data;
  }

  applySortable(data) {
    this.currentSort = data;
  }

  logData(data) {
    console.log(data);
    if (data['elem'] === 'all') {
      this.users = this.users.map((el) => {
        return Object.assign(el, { checked: data.value});
      });
    }
  }
}
