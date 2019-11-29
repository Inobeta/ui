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
      (filterChange)="stampa($event)">
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
      value: 'dashboard.goodsReceiving.ibTable.sender',
      type: TableTitlesTypes.STRING,
      filterable: true
    },
    {
      key: 'deadline',
      value: 'dashboard.goodsReceiving.ibTable.date',
      type: TableTitlesTypes.DATE,
      filterable: true
    }
  ];
  items = [
    {
      lot: 1,
      date: '10/05/2019',
      deadline: new Date(),
      sender: 'NocciolineTostate srl sede Cesena',
      article: 'Noccioline 200 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 2,
      date: '07/01/2019',
      deadline: new Date(),
      sender: 'MyNoce srl sede Forlì',
      article: 'Pistacchi crudi 150 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 3,
      date: '04/26/2019',
      deadline: new Date(),
      sender: 'Inoceci srl sede Aquila',
      article: 'Ceci tostati 20 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 4,
      date: '08/12/2019',
      deadline: new Date(),
      sender: 'MELAVERDE srl sede Faenza',
      article: 'Semi di girasole crudi 10 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 5,
      date: '05/11/2019',
      deadline: new Date(),
      sender: 'GranoInfinito srl sede Bologna',
      article: 'Mais Tostato 7 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 6,
      date: '10/05/2019',
      deadline: new Date(),
      sender: 'NocciolineTostate srl sede Cesena',
      article: 'Noccioline 200 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 7,
      date: '07/01/2019',
      deadline: new Date(),
      sender: 'MyNoce srl sede Forlì',
      article: 'Pistacchi crudi 150 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 8,
      date: '04/26/2019',
      deadline: new Date(),
      sender: 'Inoceci srl sede Aquila',
      article: 'Ceci tostati 20 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 9,
      date: '08/12/2019',
      deadline: new Date(),
      sender: 'MELAVERDE srl sede Faenza',
      article: 'Semi di girasole crudi 10 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 10,
      date: '05/11/2019',
      deadline: new Date(),
      sender: 'GranoInfinito srl sede Bologna',
      article: 'Mais Tostato 7 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 11,
      date: '10/05/2019',
      deadline: new Date(),
      sender: 'NocciolineTostate srl sede Cesena',
      article: 'Noccioline 200 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 12,
      date: '07/01/2019',
      deadline: new Date(),
      sender: 'MyNoce srl sede Forlì',
      article: 'Pistacchi crudi 150 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 13,
      date: '04/26/2019',
      deadline: new Date(),
      sender: 'Inoceci srl sede Aquila',
      article: 'Ceci tostati 20 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 14,
      date: '08/12/2019',
      deadline: new Date(),
      sender: 'MELAVERDE srl sede Faenza',
      article: 'Semi di girasole crudi 10 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 15,
      date: '05/11/2019',
      deadline: new Date(),
      sender: 'GranoInfinito srl sede Bologna',
      article: 'Mais Tostato 7 Kg',
      created_at: new Date(),
      updated_at: new Date()
    }
  ];
  filters = {};
  currentSort = {};
  selectableRows = true;

  constructor() {}

  stampa(item) {
    console.log(item);
  }

}
