import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { useColumn, useContextColumn } from 'src/app/inobeta-ui/ui/kai-table/cells';
import { createNewUser } from './users';

@Component({
  selector: 'ib-kai-table-full-example',
  template: `

  `,
  styles: [`
  :host {
    display: flex;
    flex-direction: column;
    padding: 30px;
  }

  ib-kai-table .ib-table {
    --ib-table-header-cell-color: lightgrey;
    --ib-table-header-cell-background-color: #309933;
  }
  `]
})

export class IbKaiTableFullExamplePage implements OnInit {
  dataSource = new MatTableDataSource<any>();
  columns = [
    useColumn('name'),
    useColumn('fruit'),
    useColumn('number', 'number', true),
    useContextColumn(() => [{type: 'view', icon: 'chevron_right'}])
  ];

  ngOnInit() {
    const users = Array.from({ length: 1000 }, (_, k) => createNewUser(k + 1))
    this.dataSource.data = users;
    console.log(new Set(users.map(u => u.fruit)))
  }
}
