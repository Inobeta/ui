import {Component, ViewChild, ElementRef, TemplateRef, ViewChildren} from '@angular/core';
import {TableCellAligns, TableTitles, TableTitlesTypes} from '../app/inobeta-ui/ui/table/titles.model';

@Component({
  selector: 'ib-table-example',
  template: `
  <ng-template #headerClickTemplate let-ibTable="ibTable" let-col="col">
    <div class="modal-selector" (click)="$event.stopPropagation();">
      <div class="modal-row" (click)="ibTable.resetCustomHeaderVisibility($event)">Close this popup</div>
      <div class="modal-row" (click)="ibTable.sortData({active: col.key, direction: 'asc'})">Sort ASC</div>
      <div class="modal-row" (click)="ibTable.sortData({active: col.key, direction: 'desc'})">Sort DESC</div>
      <div class="modal-row" (click)="ibTable.setFilter('sender', 'bologna')">Filter sender</div>
      <div class="modal-row" (click)="ibTable.setFilter('date', '05')">Filter expires</div>
    </div>
  </ng-template>

    <ng-template #deleteTemplate let-item="item">
      <span class="delete-button">
          <i (click)="stampa(item)" class="material-icons">search</i>
      </span>
    </ng-template>

    <ib-table
      [titles]="titles"
      [items]="items"
      (filterChange)="stampa($event)"
      [selectRowName]="'Ricevuto'"
      [templateButtons]="[{
        template: deleteTemplate,
        columnName: 'Elimina'
      }]"
      [templateHeaders]="{
        'lot': headerClickTemplate,
        'deadline': headerClickTemplate
      }"
    >
    </ib-table>
  `,
  styles: [
`

.modal-selector{
  position: absolute;
  width: 150px;
  height: 200px;
  background-color:white;
  border:1px solid black;
  color:black;
  z-index: 100;
}

.modal-row {
  border:1px solid black;
  background-color: yellow;
}
`

  ]
})

export class IbTableExampleComponent {

  titles: [
    {
      key: 'lot',
      value: 'Lotto',
      type: TableTitlesTypes.NUMBER,
      filterable: true,
      width: '10%',
      fontStyle: {
        color: 'red',
        fontWeight: 'bold',
        fontSize: 'x-large'
      }
    },
    {
      key: 'sender',
      value: 'Mittente',
      type: TableTitlesTypes.STRING,
      filterable: true
    },
    {
      key: 'date',
      value: 'Scadenza',
      type: TableTitlesTypes.STRING,
      filterable: true,
      width: '10%'
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
      date: '06/11/2019',
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

  constructor() {
  }

  stampa(item) {
    console.log('item', item);
    console.log('titles', this.titles);
  }
}
