import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { IbTableItem } from '../../models/table-item.model';
import { IbTemplateModel } from '../../models/template.model';
import { IbTableTitles } from '../../models/titles.model';
import { IbTableTotalRowApplyDialogComponent } from './table-total-row-apply-dialog.component';
import { TotalRow } from './total-row';

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

  private totalRow: TotalRow;
  
  constructor(public dialog: MatDialog) { }

  ngOnInit() {
    this.setupTotalRow();
  }

  private setupTotalRow() {
    this.totalRow = new TotalRow();
  }

  private open(key: string) {
    const dialog = this.dialog.open(IbTableTotalRowApplyDialogComponent, {
      width: '400px',
      data: { key }
    });

    dialog.afterClosed().subscribe(result => this.totalRow.toggle(key, result.function));
  }

  
}
