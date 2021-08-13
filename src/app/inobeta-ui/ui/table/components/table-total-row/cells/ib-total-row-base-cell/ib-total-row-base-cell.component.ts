import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TotalRowCell } from '../ib-total-row-default-cell/ib-total-row-default-cell.component';

@Component({
  selector: 'ib-total-row-base-cell',
  template: ``,
})
export class IbTotalRowBaseCellComponent implements TotalRowCell {
  @Input() data: any;
  @Output() addCell = new EventEmitter<any>();
}
