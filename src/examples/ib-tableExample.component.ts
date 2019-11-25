import {Component} from '@angular/core';
import {TableTitlesTypes} from '../app/inobeta-ui/ui/table/titles.model';

@Component({
  selector: 'ib-table-example',
  template: `
    <ib-table
      [titles]="titles"
      [items]="items"
      [filterValues]="filters"
      [selectableRows]="selectableRows"
      [hasAdd]="hasAdd">
    </ib-table>
  `
})

export class IbTableExampleComponent {

  titles = [
    {
      key: 'lot',
      value: 'dashboard.goodsReceiving.ibTable.lot',
      type: TableTitlesTypes.NUMBER,
      filterable: true
    },
    {
      key: 'date',
      value: 'dashboard.goodsReceiving.ibTable.date',
      type: TableTitlesTypes.DATE,
      filterable: true
    },
    {
      key: 'deadline',
      value: 'dashboard.goodsReceiving.ibTable.deadline',
      type: TableTitlesTypes.CUSTOMDATE,
      filterable: true
    },
    {
      key: 'sender',
      value: 'dashboard.goodsReceiving.ibTable.sender',
      type: TableTitlesTypes.STRING,
      filterable: true
    },
    {
      key: 'article',
      value: 'dashboard.goodsReceiving.ibTable.article',
      type: TableTitlesTypes.STRING,
      filterable: true
    }
  ];
  items = [
    {
      lot: 45382,
      date: new Date(),
      deadline: new Date(),
      sender: 'NocciolineTostate srl sede Cesena',
      article: 'Noccioline 200 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 45384,
      date: new Date(),
      deadline: new Date(),
      sender: 'MyNoce srl sede Forlì',
      article: 'Pistacchi crudi 150 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 45463,
      date: new Date(),
      deadline: new Date(),
      sender: 'Inoceci srl sede Aquila',
      article: 'Ceci tostati 20 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 45578,
      date: new Date(),
      deadline: new Date(),
      sender: 'MELAVERDE srl sede Faenza',
      article: 'Semi di girasole crudi 10 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 45899,
      date: new Date(),
      deadline: new Date(),
      sender: 'GranoInfinito srl sede Bologna',
      article: 'Mais Tostato 7 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
  ];
  filters = {};
  currentSort = {};
  selectableRows = true;
  hasAdd = false;

  constructor() {}

}
