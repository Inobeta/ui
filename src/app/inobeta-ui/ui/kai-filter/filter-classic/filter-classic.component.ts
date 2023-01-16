import { Component, forwardRef } from '@angular/core';
import { IbFilterBase } from '../filter-base/filter-base';

@Component({
  selector: 'ib-filter-classic',
  templateUrl: 'filter-classic.component.html',
  providers: [{provide: IbFilterBase, useExisting: forwardRef(() => IbFilterClassic)}],
})
export class IbFilterClassic extends IbFilterBase {
  constructor() {
    super();
  }
}
