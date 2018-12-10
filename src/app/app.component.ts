import {Component} from '@angular/core';
import {TableTitlesTypes} from './inobeta-ui/ui/table/titles.model';
import {SortableColumn} from './inobeta-ui/ui/table/tablePrime/sortableColumn.model';
import {AuthService} from './inobeta-ui/auth/auth.service';

@Component({
  selector: 'ib-root',
  template: `
    <ib-table-prime
      [titles]="titles"
      [items]="users"
      [filterValues]="filterValues"
      [currentSort]="currentSort"
      (onFilterChange)="applyFilters($event)"
      (onSortChange)="applySortable($event)"
      (onSelectionChange)="logData($event)"
    ></ib-table-prime>



  `
})
export class AppComponent {
  filterValues = {};
  currentSort = new SortableColumn();


  titles = [
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


  users = [
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


  constructor(svcAuth: AuthService) {

  }


  applyFilters(data) {
    this.filterValues = data;
  }

  applySortable(data) {
    this.currentSort = data;
  }

  logData(data) {
    console.log(data);
    if (data.elem === 'all') {
      this.users = this.users.map((el) => {
        return Object.assign(el, { checked: data.value});
      });
    }
  }
}
