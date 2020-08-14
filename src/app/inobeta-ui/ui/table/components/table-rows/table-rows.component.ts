import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TableTitles, TableTitlesTypes, TableCellAligns } from '../../titles.model';
import { TemplateModel } from '../../template.model';

@Component({
  // tslint:disable-next-line: component-selector
  selector: '[ib-table-rows]',
  templateUrl: './table-rows.component.html',
  styleUrls: ['./table-rows.component.css']
})
export class TableRowsComponent implements OnInit {
  @Input() sortedData: any[];
  @Input() titles: TableTitles[] = [];
  @Input() customItemTemplate: any;
  @Input() selectableRows = true;
  @Input() templateButtons: TemplateModel[] = [];

  @Output() rowClicked: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowChecked: EventEmitter<any> = new EventEmitter<any>();

  typeEnum = TableTitlesTypes;
  alignEnum = TableCellAligns;

  constructor() { }

  ngOnInit() {
  }

  emitItemAndCheckbox(item, checkbox) {
    this.rowChecked.emit({ item, isChecked: checkbox });
  }
}
