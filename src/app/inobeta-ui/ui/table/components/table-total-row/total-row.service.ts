import { Injectable } from '@angular/core';
import { IbTotalRowAddCellComponent } from './cells/ib-total-row-add-cell/ib-total-row-add-cell.component';
import { IbTotalRowAvgCellComponent } from './cells/ib-total-row-avg-cell/ib-total-row-avg-cell.component';
import { IbTotalRowSumCellComponent } from './cells/ib-total-row-sum-cell/total-row-sum-cell.component';


/**
* @deprecated Use IbKaiTableModule
*/
@Injectable({
  providedIn: 'root'
})
export class TotalRowService {
  static components = {
    '_default': IbTotalRowAddCellComponent,
    sum: IbTotalRowSumCellComponent,
    avg: IbTotalRowAvgCellComponent
  };

  getComponentByFunctionName(name: string) {
    return TotalRowService.components[name];
  }

  getDefaultComponent() {
    return IbTotalRowAddCellComponent;
  }
}
