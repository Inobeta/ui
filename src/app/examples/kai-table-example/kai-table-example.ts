import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { useColumn } from 'src/app/inobeta-ui/ui/kai-table/cells';
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
  `]
})
export class IbKaiTableExamplePage {
  dataSource = new MatTableDataSource<any>();
  columns = [
    useColumn('name', 'name'),
    useColumn('fruit'),
    useColumn('number', 'number', true),
  ];

  ngOnInit() {
    const users = Array.from({ length: 1000 }, (_, k) => createNewUser(k + 1))
    this.dataSource.data = users
  }
}
