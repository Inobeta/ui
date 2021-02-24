import { Component, OnInit } from '@angular/core';
import { IbTableTitlesTypes } from 'src/app/inobeta-ui/ui/table/models/titles.model';

@Component({
  selector: 'ib-table-example',
  templateUrl: 'ib-tableExample.component.html',
  styleUrls: ['./ib-tableExample.component.css']
})

export class IbTableExampleComponent implements OnInit {

  titles = [
    {
      key: 'lot',
      value: 'Lotto',
      type: IbTableTitlesTypes.CUSTOM,
      filterable: true,
      width: '10%',
    },
    {
      key: 'sender',
      value: 'Mittente',
      type: IbTableTitlesTypes.STRING,
      filterable: true
    },
    {
      key: 'date',
      value: 'receiptGoods.historyGoods.table.date',
      type: IbTableTitlesTypes.STRING,
      filterable: true,
      width: '10%'
    },
    {
      key: 'userType',
      value: 'Tipo Utente',
      type: IbTableTitlesTypes.MATERIAL_SELECT,
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
      type: IbTableTitlesTypes.INPUT_NUMBER,
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

  pdfCustomStyles = {
    headStyles: { fillColor: [232, 202, 232] },
    columnStyles: { sender: { halign: 'center' }},
  };

  pdfSetup = {
    orientation: 'p'
  }
  constructor() { }


  stampa(item) {
    console.log(item);
  }

  ngOnInit(): void { }

  prova2($event: any) {
    console.log($event);
  }
}
