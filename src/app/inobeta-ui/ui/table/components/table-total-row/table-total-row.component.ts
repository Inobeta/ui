import { Component, Input } from '@angular/core';
import { IbTableItem } from '../../models/table-item.model';
import { IbTemplateModel } from '../../models/template.model';
import { IbTableTitles } from '../../models/titles.model';
import { IbTableTotalRowState } from '../../store/reducers/table.reducer';

@Component({
  selector: '[ib-table-total-row]',
  templateUrl: './table-total-row.component.html',
  styleUrls: ['./table-total-row.component.css']
})
export class IbTableTotalRowComponent {
  @Input() titles: IbTableTitles[] = [];
  @Input() selectableRows = true;
  @Input() templateButtons: IbTemplateModel[] = [];
  @Input() hasEdit = false;
  @Input() hasDelete = false;
  @Input() testData = [];
  @Input() sortedData: IbTableItem[];
  @Input() filteredData: IbTableItem[];
  @Input() totalRowDef: IbTableTotalRowState[];

  public getTotalRowCellComponent(key) {
    return this.totalRowDef.find(t => t.columnName === key)?.component;
  }
}
