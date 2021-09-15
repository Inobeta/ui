import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { IbMatTextboxControl } from 'src/app/inobeta-ui/ui/material-forms/controls/textbox';
import { IbTableItem } from 'src/app/inobeta-ui/ui/table/models/table-item.model';
import { IbStickyAreas, IbTableAction, IbTableActionsPosition, IbTableTitlesTypes } from 'src/app/inobeta-ui/ui/table/models/titles.model';
import { IbTableComponent } from 'src/app/inobeta-ui/ui/table/table.component';
import { sampleData } from '../json-data';

@Component({
  selector: 'ib-table-example',
  templateUrl: 'table-example.component.html',
  styleUrls: ['./table-example.component.css']
})
//ANY, HOUR, COMBOBOX
export class IbTableStickyExampleComponent implements OnInit {
  @ViewChild('ibTable', {static: true}) ibTable: IbTableComponent;
  stickyAreas = [
    IbStickyAreas.HEADER,
    IbStickyAreas.FOOTER,
    IbStickyAreas.EDIT,
    IbStickyAreas.DELETE,
    IbStickyAreas.SELECT,
    IbStickyAreas.SETTINGS
  ];
  selectableRows = true;
  tableName = 'pippo';
  ibTableActionsPosition = IbTableActionsPosition;
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
      sticky: 'start'
    },
    {
      key: 'age',
      value: 'Età',
      type: IbTableTitlesTypes.NUMBER,
      format: '1.0-0',
      filterable: true,
      width: '2%',
    },
    {
      key: 'isActive',
      value: 'Attivo',
      type: IbTableTitlesTypes.BOOLEAN,
      filterable: true,
      width: '10%',
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
      width: '10%',
      sticky: 'end',
    }
  ];
  items: IbTableItem[] = sampleData

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
  ];
  pdfCustomStyles = {
    headStyles: { fillColor: [232, 202, 232] },
    columnStyles: { sender: { halign: 'center' }},
  };

  pdfSetup = {
    orientation: 'p'
  };
  constructor() { }

  ngOnInit(): void {}

  consolePrint(item) {
    console.log(item);
    console.log(this.ibTable.isValidForm(), this.ibTable.getFormValues());
  }

  getBaseElem() {
    return new IbMatTextboxControl({
      key: 'balance',
      label: 'qt',
      type: 'number',
      required: true,
      validators: [Validators.min(0)]
    });
  }

  setValidators(form: FormGroup) {
    form.controls.balance.setValidators([Validators.required, Validators.min(1)]);
    return form;
  }

  rowClass(item) {
    return {
      'evidence-row': item.guid === 'e8ab3af6-9725-4163-8706-476b5dd09dfb'
    };
  }
}
