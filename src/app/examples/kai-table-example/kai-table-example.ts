import { Component } from '@angular/core';
import { IbTableDef } from '../../inobeta-ui/ui/kai-table/table.types';
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

  ib-kai-table ::ng-deep .ib-cell-number{
    text-align: right;
    padding-right: 20px;
  }

  ib-kai-table ::ng-deep .ib-action-the-search-key{
    color: purple;
    font-weight: bold;
  }

  ib-kai-table ::ng-deep table th:first-of-type{
    border-top-left-radius: 20px;
  }

  ib-kai-table ::ng-deep table th:last-of-type{
    border-top-right-radius: 20px;
  }
  ib-kai-table ::ng-deep .ib-table-scrollable{
    height: 450px;
  }
  `]
})
export class IbKaiTableExamplePage {
  data: any[];

  tableDef: IbTableDef = {
    /*paginator: {
      hide: true
    },*/
    initialSort: {
      active: 'fruit',
      direction: 'asc'
    }
  }

  ngOnInit() {
    this.data = Array.from({ length: 1000 }, (_, k) => createNewUser(k + 1))
  }

  testClick(ev){
    console.log('ev', ev)
  }
}
