import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { IbTableComponent } from 'src/app/inobeta-ui/ui/table';
import { IbTableItem } from 'src/app/inobeta-ui/ui/table/models/table-item.model';
import { IbTableAction, IbTableTitlesTypes } from 'src/app/inobeta-ui/ui/table/models/titles.model';
import { sampleData } from '../json-data';

@Component({
  selector: 'ib-table-example',
  templateUrl: 'table-example.component.html',
  styleUrls: ['./table-example.component.css']
})
//ANY, HOUR, COMBOBOX
export class IbTableExampleNoReduxComponent implements OnInit {
  @ViewChild('ibTable', {static: true}) ibTable: IbTableComponent
  selectableRows = true;
  titles = [
    {
      key: 'guid',
      value: 'GUID',
      type: IbTableTitlesTypes.STRING,
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
      type: IbTableTitlesTypes.NUMBER,
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


  constructor() { }

  stampa(item) {
    console.log(item);
  }

  ngOnInit(): void {
    this.ibTable.setFilter('balance', [
      {
        condition: '>',
        value: '1000'
      },
      {
        condition: '<=',
        value: '2000'
      }
    ])


    this.ibTable.setFilter('picture', 'place')

  }

  consolePrint(item){
    console.log(item);
  }
}
