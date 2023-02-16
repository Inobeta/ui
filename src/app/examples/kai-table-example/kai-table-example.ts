import {  Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { useColumn, useContextColumn, useDateColumn, useNumberColumn } from 'src/app/inobeta-ui/ui/kai-table/cells';
import { IbTableDef } from 'src/app/inobeta-ui/ui/kai-table/table.types';
import { createNewUser } from './users';

@Component({
  selector: 'ib-kai-table-example',
  templateUrl: 'kai-table-example.html',
  styles: [`
  :host {
    display: flex;
    flex-direction: column;
    padding: 30px;
  }

  ib-kai-table >>> .ib-cell-number{
    text-align: right;
    padding-right: 20px;
  }

  ib-kai-table >>> .ib-action-the-search-key{
    color: purple;
    font-weight: bold;
  }

  ib-kai-table >>> table th:first-of-type{
    border-top-left-radius: 20px;
  }

  ib-kai-table >>> table th:last-of-type{
    border-top-right-radius: 20px;
  }
  `]
})
export class IbKaiTableExamplePage {
  dataSource = new MatTableDataSource<any>();
  columns = [
    useColumn('name', 'name'),
    useColumn('Frutta','fruit', true),
    useNumberColumn('number', 'number', true),
    useDateColumn('My Date', 'aDate', true),
    useDateColumn('My Date String', 'aDateString', true, 'dd/MMM/yyyy HH:mm'),
    useContextColumn(() => [{type: 'the-search-key', icon: 'search'}])
  ];

  tableDef: IbTableDef = {
    /*paginator: {
      hide: true
    },*/
    initialSort: {
      active: 'fruit',
      direction: 'asc'
    },
    stickyHeader: true
  }

  ngOnInit() {
    const users = Array.from({ length: 1000 }, (_, k) => createNewUser(k + 1))
    this.dataSource.data = users
  }
}
