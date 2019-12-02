import {Component} from '@angular/core';
import {TableTitlesTypes} from '../app/inobeta-ui/ui/table/titles.model';

@Component({
  selector: 'ib-table-example',
  template: `
    <ib-table
      [titles]="titles"
      [items]="items"
      (filterChange)="stampa($event)"
      [selectRowName]="'Ricevuto'">
    </ib-table>
  `
})

export class IbTableExampleComponent {

  titles = [
    {
      key: 'lot',
      value: 'Lotto',
      type: TableTitlesTypes.NUMBER,
      filterable: true
    },
    {
      key: 'sender',
      value: 'Mittente',
      type: TableTitlesTypes.STRING,
      filterable: true
    },
    {
      key: 'deadline',
      value: 'Scadenza',
      type: TableTitlesTypes.DATE,
      filterable: true
    }
  ];
  items = [
    {
      lot: 17,
      date: '10/05/2019',
      deadline: new Date(2019, 4, 12),
      sender: 'NocciolineTostate srl sede Cesena',
      article: 'Noccioline 200 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 2,
      date: '07/01/2019',
      deadline: new Date(2019, 2, 12),
      sender: 'MyNoce srl sede Forlì',
      article: 'Pistacchi crudi 150 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 3,
      date: '04/26/2019',
      deadline: new Date(2019, 6, 12),
      sender: 'Inoceci srl sede Aquila',
      article: 'Ceci tostati 20 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 4,
      date: '08/12/2019',
      deadline: new Date(2019, 4, 10),
      sender: 'MELAVERDE srl sede Faenza',
      article: 'Semi di girasole crudi 10 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 5,
      date: '05/11/2019',
      deadline: new Date(2019, 4, 19),
      sender: 'GranoInfinito srl sede Bologna',
      article: 'Mais Tostato 7 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 6,
      date: '10/05/2019',
      deadline: new Date(2019, 7, 12),
      sender: 'NocciolineTostate srl sede Cesena',
      article: 'Noccioline 200 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 7,
      date: '07/01/2019',
      deadline: new Date(2019, 9, 12),
      sender: 'MyNoce srl sede Forlì',
      article: 'Pistacchi crudi 150 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 8,
      date: '04/26/2019',
      deadline: new Date(2019, 4, 2),
      sender: 'Inoceci srl sede Aquila',
      article: 'Ceci tostati 20 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 9,
      date: '08/12/2019',
      deadline: new Date(2019, 4, 6),
      sender: 'MELAVERDE srl sede Faenza',
      article: 'Semi di girasole crudi 10 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 10,
      date: '05/11/2019',
      deadline: new Date(2019, 8, 12),
      sender: 'GranoInfinito srl sede Bologna',
      article: 'Mais Tostato 7 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 11,
      date: '10/05/2019',
      deadline: new Date(2019, 7, 1),
      sender: 'NocciolineTostate srl sede Cesena',
      article: 'Noccioline 200 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 12,
      date: '07/01/2019',
      deadline: new Date(2019, 1, 10),
      sender: 'MyNoce srl sede Forlì',
      article: 'Pistacchi crudi 150 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 13,
      date: '04/26/2019',
      deadline: new Date(2019, 2, 5),
      sender: 'Inoceci srl sede Aquila',
      article: 'Ceci tostati 20 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 14,
      date: '08/12/2019',
      deadline: new Date(2019, 6, 6),
      sender: 'MELAVERDE srl sede Faenza',
      article: 'Semi di girasole crudi 10 Kg',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      lot: 15,
      date: '05/11/2019',
      deadline: new Date(2019, 9, 9),
      sender: 'GranoInfinito srl sede Bologna',
      article: 'Mais Tostato 7 Kg',
      created_at: new Date(),
      updated_at: new Date()
    }
  ];

  constructor() {}

  stampa(item) {
    console.log(item);
  }

}
