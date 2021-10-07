import { Component } from '@angular/core';
import { IbTotalRowBaseCellComponent } from '../ib-total-row-base-cell/ib-total-row-base-cell.component';
import { TotalRowCell } from '../ib-total-row-default-cell/ib-total-row-default-cell.component';

@Component({
  selector: 'ib-total-row-add-cell',
  templateUrl: './ib-total-row-add-cell.component.html',
})
export class IbTotalRowAddCellComponent extends IbTotalRowBaseCellComponent implements TotalRowCell {}
