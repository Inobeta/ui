import { Component, } from '@angular/core';
import { IbTotalRowBaseCellComponent } from '../ib-total-row-base-cell/ib-total-row-base-cell.component';

@Component({
  selector: 'ib-total-row-avg-cell',
  templateUrl: './ib-total-row-avg-cell.template.html',
})
export class IbTotalRowAvgCellComponent extends IbTotalRowBaseCellComponent {
  apply(rows: any[]) {
    return rows.reduce((acc, cur) => acc + cur[this.data.title.key], 0) / rows.length;
  }
}
