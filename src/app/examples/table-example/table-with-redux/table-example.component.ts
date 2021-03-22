import { Component, OnInit, ViewChild } from '@angular/core';
import { IbTableItem } from 'src/app/inobeta-ui/ui/table/models/table-item.model';
import { IbTableAction, IbTableTitlesTypes } from 'src/app/inobeta-ui/ui/table/models/titles.model';
import { IbTableComponent } from 'src/app/inobeta-ui/ui/table/table.component';
import { sampleData } from '../json-data';

@Component({
  selector: 'ib-table-example',
  templateUrl: 'table-example.component.html',
  styleUrls: ['./table-example.component.css']
})
//ANY, HOUR, COMBOBOX
export class IbTableExampleComponent implements OnInit {
  @ViewChild('ibTable', {static: true}) ibTable: IbTableComponent
  selectableRows = true;
  tableName = 'pippo'
  titles = [
    {
      key: 'guid',
      value: 'GUID',
      type: IbTableTitlesTypes.CUSTOM,
      width: '20%',
    },
    {
      key: 'picture',
      value: 'Link',
      type: IbTableTitlesTypes.STRING,
      filterable: true,
      width: '20%',
    },
    {
      key: 'company',
      value: 'Company',
      type: IbTableTitlesTypes.ANY,
      filterable: true,
      width: '10%',
    },
    {
      key: 'age',
      value: 'Età',
      type: IbTableTitlesTypes.NUMBER,
      format: '1.0-0',
      filterable: true,
      width: '2%'
    },
    {
      key: 'isActive',
      value: 'Attivo',
      type: IbTableTitlesTypes.BOOLEAN,
      filterable: true,
      width: '10%'
    },
    {
      key: 'balance',
      value: 'Qt',
      type: IbTableTitlesTypes.INPUT_NUMBER,
      filterable: true,
      placeHolderInput: 'Inserisci qt',
      width: '10%'
    },
    {
      key: 'registered',
      value: 'Data',
      type: IbTableTitlesTypes.DATE,
      filterable: true,
      width: '10%'
    },
    {
      key: 'label',
      value: 'Etichetta',
      type: IbTableTitlesTypes.TAG,
      filterable: true,
      width: '10%'
    }
  ];
  items:IbTableItem[] = sampleData;

  actions: IbTableAction[] = [
    {
      label: 'test accent',
      color: 'accent',
      handler: (selectedItems) => this.consolePrint(selectedItems)
    },
    {
      label: 'test warn',
      color: 'warn',
      handler: (selectedItems) => this.consolePrint(selectedItems)
    },
    {
      label: 'test primary',
      color: 'primary',
      handler: (selectedItems) => this.consolePrint(selectedItems)
    },
    {
      label: 'test link',
      color: 'link',
      handler: (selectedItems) => this.consolePrint(selectedItems)
    }
  ]
  pdfCustomStyles = {
    headStyles: { fillColor: [232, 202, 232] },
    columnStyles: { sender: { halign: 'center' }},
  };

  pdfSetup = {
    orientation: 'p'
  };
  constructor() { }


  stampa(item) {
    console.log(item);
  }

  ngOnInit(): void {

    this.ibTable.setFilter('balance', [
      {
        condition: '>',
        value: '2100'
      },
      {
        condition: '<=',
        value: '3000'
      }
    ], 0, true, this.tableName)

    //Full parameters with table name must be sent only when redux is enabled
    this.ibTable.setFilter('picture', 'place', 0, true, this.tableName)


  }

  consolePrint(item){
    console.log(item);
  }
}
