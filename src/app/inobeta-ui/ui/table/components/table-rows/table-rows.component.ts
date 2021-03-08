import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { IbTableTitles, IbTableTitlesTypes, IbTableCellAligns } from '../../models/titles.model';
import { IbTemplateModel } from '../../models/template.model';

@Component({
  // tslint:disable-next-line: component-selector
  selector: '[ib-table-rows]',
  templateUrl: './table-rows.component.html',
  styleUrls: ['./table-rows.component.css']
})
export class IbTableRowsComponent implements OnInit {
  @Input() sortedData: any[];
  @Input() titles: IbTableTitles[] = [];
  @Input() customItemTemplate: any;
  @Input() selectableRows = true;
  @Input() templateButtons: IbTemplateModel[] = [];

  @Output() rowClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowChecked: EventEmitter<any> = new EventEmitter<any>();

  typeEnum = IbTableTitlesTypes;
  alignEnum = IbTableCellAligns;

  constructor() { }

  ngOnInit() {
  }

  emitItemAndCheckbox(item, checkbox) {
    this.rowChecked.emit({ item, isChecked: checkbox });
  }
}
