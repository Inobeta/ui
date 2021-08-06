import { Component, Input, Output } from '@angular/core';
import { IbTotalRowBaseCellComponent } from '../ib-total-row-base-cell/ib-total-row-base-cell.component';
import { TotalRowCell } from '../ib-total-row-default-cell/ib-total-row-default-cell.component';

@Component({
  selector: 'ib-total-row-sum-cell',
  templateUrl: './total-row-sum-cell.component.html',
  styles: []
})
export class IbTotalRowSumCellComponent extends IbTotalRowBaseCellComponent implements TotalRowCell {
  apply(data: any[]) {
    return data.reduce((acc, cur) => acc + cur[this.data.title.key], 0);
  }
}

