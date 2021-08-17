import { Injectable } from '@angular/core';
import { IbTotalRowAvgCellComponent } from './cells/ib-total-row-avg-cell/ib-total-row-avg-cell.component';
import { IbTotalRowSumCellComponent } from './cells/ib-total-row-sum-cell/total-row-sum-cell.component';

@Injectable({
  providedIn: 'root'
})
export class TotalRowService {
  static components = {
    sum: IbTotalRowSumCellComponent,
    avg: IbTotalRowAvgCellComponent
  };

  getComponentByFunctionName(name: string) {
    return TotalRowService.components[name];
  }
}
