import {Component} from '@angular/core';
import {TableTitlesTypes} from './inobeta-ui/ui/table/titles.model';
import {SortableColumn} from './inobeta-ui/ui/table/tablePrime/sortableColumn.model';

@Component({
  selector: 'app-root',
  template: `
    <ib-table-prime
      [titles]="titles"
      [items]="users"
      [filterValues]="filterValues"
      [currentSort]="currentSort"
      (onFilterChange)="applyFilters($event)"
      (onSortChange)="applySortable($event)"
    ></ib-table-prime>



  `
})
export class AppComponent {
  filterValues = {};
  currentSort = new SortableColumn();


  titles = [
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
    {name: 'pippo', surname: 'franco'}
  ];

  applyFilters(data) {
    this.filterValues = data;
  }

  applySortable(data) {
    this.currentSort = data;
  }
}
