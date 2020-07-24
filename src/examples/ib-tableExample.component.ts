import { Component, OnInit } from '@angular/core';
import { TableTitlesTypes } from '../app/inobeta-ui/ui/table/titles.model';
import { Store } from '@ngrx/store';

@Component({
  selector: 'ib-table-example',
  template: `
    <!--<ng-template #headerClickTemplate let-ibTable="ibTable" let-col="col">
      <div class="modal-selector" (click)="$event.stopPropagation();">
        <div class="modal-row" (click)="ibTable.resetCustomHeaderVisibility($event)">Close this popup</div>
        <div class="modal-row" (click)="ibTable.sortData({active: col.key, direction: 'asc'})">Sort ASC</div>
        <div class="modal-row" (click)="ibTable.sortData({active: col.key, direction: 'desc'})">Sort DESC</div>
        <div class="modal-row" (click)="ibTable.setFilter('sender', 'bologna')">Filter sender</div>
        <div class="modal-row" (click)="ibTable.setFilter('date', '05')">Filter expires</div>
      </div>
    </ng-template>-->

    <ng-template #deleteTemplate let-item="item">
      <span class="delete-button">
          <i class="material-icons">search</i>
      </span>
    </ng-template>

    <ng-template #headerClickTemplate let-ibTable="ibTable" let-col="col">
      <table-header-popup
        [ibTable]="ibTable"
        [col]="col">
      </table-header-popup>
    </ng-template>
    

    <ib-table
      [customItemTemplate]="{ lot: lotTemplate }"
      [selectableRows]="true"
      (rowChecked)="prova2($event)"
      [titles]="titles"
      [items]="items"
      [selectRowName]="'Ricevuto'"
      [templateButtons]="[{
        template: deleteTemplate,
        columnName: 'Elimina'
      }]"
      [templateHeaders]="{
        'lot': headerClickTemplate,
        'sender': headerClickTemplate,
        'date': headerClickTemplate,
        'qt': headerClickTemplate
      }">
      <ng-template #lotTemplate let-item="item">
        <div style="font-weight: bold; color: red;">{{item.lot}}</div>
      </ng-template>
    </ib-table>
  `,
  styles: [
    `      
      .modal-selector {
        position: absolute;
        width: 150px;
        height: 200px;
        background-color: white;
        border: 1px solid black;
        color: black;
        z-index: 100;
      }

      .modal-row {
        border: 1px solid black;
        background-color: yellow;
      }
    `

  ]
})

export class IbTableExampleComponent implements OnInit {

  titles = [
    {
      key: 'lot',
      value: 'Lotto',
      type: TableTitlesTypes.CUSTOM,
      filterable: true,
      width: '10%',
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
    },
    {
      key: 'userType',
      value: 'Tipo Utente',
      type: TableTitlesTypes.MATERIAL_SELECT,
      width: '10%',
      materialSelectItems: [
        {
          value: 1,
          label: 'Op Lavoraz.'
        },
        {
          value: 3,
          label: 'Super Admin'
        }
      ]
    },
    {
      key: 'qt',
      value: 'Qt',
      type: TableTitlesTypes.INPUT_NUMBER,
      filterable: true,
      placeHolderInput: 'Inserisci qt'
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
      updated_at: new Date(),
      userType: 1,
      qt: 5
    },
    {
      lot: 2,
      date: '07/01/2019',
      deadline: new Date(2019, 2, 12),
      sender: 'MyNoce srl sede Forlì',
      article: 'Pistacchi crudi 150 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 3,
      qt: 6
    },
    {
      lot: 3,
      date: '04/26/2019',
      deadline: new Date(2019, 6, 12),
      sender: 'Inoceci srl sede Aquila',
      article: 'Ceci tostati 20 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 1,
      qt: 7
    },
    {
      lot: 17,
      date: '10/05/2019',
      deadline: new Date(2019, 4, 12),
      sender: 'NocciolineTostate srl sede Cesena',
      article: 'Noccioline 200 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 1,
      qt: 5
    },
    {
      lot: 2,
      date: '07/01/2019',
      deadline: new Date(2019, 2, 12),
      sender: 'MyNoce srl sede Forlì',
      article: 'Pistacchi crudi 150 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 3,
      qt: 6
    },
    {
      lot: 3,
      date: '04/26/2019',
      deadline: new Date(2019, 6, 12),
      sender: 'Inoceci srl sede Aquila',
      article: 'Ceci tostati 20 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 1,
      qt: 7
    },
    {
      lot: 17,
      date: '10/05/2019',
      deadline: new Date(2019, 4, 12),
      sender: 'NocciolineTostate srl sede Cesena',
      article: 'Noccioline 200 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 1,
      qt: 5
    },
    {
      lot: 2,
      date: '07/01/2019',
      deadline: new Date(2019, 2, 12),
      sender: 'MyNoce srl sede Forlì',
      article: 'Pistacchi crudi 150 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 3,
      qt: 6
    },
    {
      lot: 3,
      date: '04/26/2019',
      deadline: new Date(2019, 6, 12),
      sender: 'Inoceci srl sede Aquila',
      article: 'Ceci tostati 20 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 1,
      qt: 7
    },
    {
      lot: 17,
      date: '10/05/2019',
      deadline: new Date(2019, 4, 12),
      sender: 'NocciolineTostate srl sede Cesena',
      article: 'Noccioline 200 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 1,
      qt: 5
    },
    {
      lot: 2,
      date: '07/01/2019',
      deadline: new Date(2019, 2, 12),
      sender: 'MyNoce srl sede Forlì',
      article: 'Pistacchi crudi 150 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 3,
      qt: 6
    },
    {
      lot: 3,
      date: '04/26/2019',
      deadline: new Date(2019, 6, 12),
      sender: 'Inoceci srl sede Aquila',
      article: 'Ceci tostati 20 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 1,
      qt: 7
    },
    {
      lot: 17,
      date: '10/05/2019',
      deadline: new Date(2019, 4, 12),
      sender: 'NocciolineTostate srl sede Cesena',
      article: 'Noccioline 200 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 1,
      qt: 5
    },
    {
      lot: 2,
      date: '07/01/2019',
      deadline: new Date(2019, 2, 12),
      sender: 'MyNoce srl sede Forlì',
      article: 'Pistacchi crudi 150 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 3,
      qt: 6
    },
    {
      lot: 3,
      date: '04/26/2019',
      deadline: new Date(2019, 6, 12),
      sender: 'Inoceci srl sede Aquila',
      article: 'Ceci tostati 20 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 1,
      qt: 7
    },
    {
      lot: 17,
      date: '10/05/2019',
      deadline: new Date(2019, 4, 12),
      sender: 'NocciolineTostate srl sede Cesena',
      article: 'Noccioline 200 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 1,
      qt: 5
    },
    {
      lot: 2,
      date: '07/01/2019',
      deadline: new Date(2019, 2, 12),
      sender: 'MyNoce srl sede Forlì',
      article: 'Pistacchi crudi 150 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 3,
      qt: 6
    },
    {
      lot: 3,
      date: '04/26/2019',
      deadline: new Date(2019, 6, 12),
      sender: 'Inoceci srl sede Aquila',
      article: 'Ceci tostati 20 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 1,
      qt: 7
    },
    {
      lot: 17,
      date: '10/05/2019',
      deadline: new Date(2019, 4, 12),
      sender: 'NocciolineTostate srl sede Cesena',
      article: 'Noccioline 200 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 1,
      qt: 5
    },
    {
      lot: 2,
      date: '07/01/2019',
      deadline: new Date(2019, 2, 12),
      sender: 'MyNoce srl sede Forlì',
      article: 'Pistacchi crudi 150 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 3,
      qt: 6
    },
    {
      lot: 3,
      date: '04/26/2019',
      deadline: new Date(2019, 6, 12),
      sender: 'Inoceci srl sede Aquila',
      article: 'Ceci tostati 20 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 1,
      qt: 7
    },
    {
      lot: 17,
      date: '10/05/2019',
      deadline: new Date(2019, 4, 12),
      sender: 'NocciolineTostate srl sede Cesena',
      article: 'Noccioline 200 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 1,
      qt: 5
    },
    {
      lot: 2,
      date: '07/01/2019',
      deadline: new Date(2019, 2, 12),
      sender: 'MyNoce srl sede Forlì',
      article: 'Pistacchi crudi 150 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 3,
      qt: 6
    },
    {
      lot: 3,
      date: '04/26/2019',
      deadline: new Date(2019, 6, 12),
      sender: 'Inoceci srl sede Aquila',
      article: 'Ceci tostati 20 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 1,
      qt: 7
    },
    {
      lot: 17,
      date: '10/05/2019',
      deadline: new Date(2019, 4, 12),
      sender: 'NocciolineTostate srl sede Cesena',
      article: 'Noccioline 200 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 1,
      qt: 5
    },
    {
      lot: 2,
      date: '07/01/2019',
      deadline: new Date(2019, 2, 12),
      sender: 'MyNoce srl sede Forlì',
      article: 'Pistacchi crudi 150 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 3,
      qt: 6
    },
    {
      lot: 3,
      date: '04/26/2019',
      deadline: new Date(2019, 6, 12),
      sender: 'Inoceci srl sede Aquila',
      article: 'Ceci tostati 20 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 1,
      qt: 7
    },
    {
      lot: 17,
      date: '10/05/2019',
      deadline: new Date(2019, 4, 12),
      sender: 'NocciolineTostate srl sede Cesena',
      article: 'Noccioline 200 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 1,
      qt: 5
    },
    {
      lot: 2,
      date: '07/01/2019',
      deadline: new Date(2019, 2, 12),
      sender: 'MyNoce srl sede Forlì',
      article: 'Pistacchi crudi 150 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 3,
      qt: 6
    },
    {
      lot: 3,
      date: '04/26/2019',
      deadline: new Date(2019, 6, 12),
      sender: 'Inoceci srl sede Aquila',
      article: 'Ceci tostati 20 Kg',
      created_at: new Date(),
      updated_at: new Date(),
      userType: 1,
      qt: 7
    }
  ];

  constructor() { }


  stampa(item) {
    console.log(item);
  }

  ngOnInit(): void { }

  prova2($event: any) {
    console.log($event);
  }
}
