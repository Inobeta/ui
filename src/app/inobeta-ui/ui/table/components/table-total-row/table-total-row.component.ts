import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IbTableItem, IbTableTitles, IbTemplateModel } from 'public_api';
import { IbTableTitlesTypes } from '../../models/titles.model';
import { IbTableRowApplyDialogComponent, TotalRow } from './total-row';

@Component({
  selector: '[ib-table-total-row]',
  templateUrl: './table-total-row.component.html',
  styleUrls: ['./table-total-row.component.css']
})
export class IbTableTotalRowComponent implements OnInit {
  @Input() titles: IbTableTitles[] = [];
  @Input() selectableRows = true;
  @Input() templateButtons: IbTemplateModel[] = [];
  @Input() hasEdit = false;
  @Input() hasDelete = false;
  @Input() testData = [];
  @Input() sortedData: IbTableItem[];
  @Input() filteredData: IbTableItem[];

  @Output() testEmit = new EventEmitter<any>();

  private totalRow: TotalRow;
  
  constructor(public dialog: MatDialog) { }

  ngOnInit() {
    this.setupTotalRow();
  }

  clickedTotal(title: IbTableTitles) {
    this.testEmit.emit({ column: title });
  }

  private setupTotalRow() {
    this.totalRow = new TotalRow();
  }

  private open(key: string) {
    const dialog = this.dialog.open(IbTableRowApplyDialogComponent, {
      width: '400px',
      data: { key }
    });

    dialog.afterClosed().subscribe(result => this.totalRow.toggle(key, result.function));
  }

  private isRowTypeSupported(title: IbTableTitles) {
    return title.type === IbTableTitlesTypes.NUMBER;
  }
}
